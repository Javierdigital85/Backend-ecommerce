import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient, Collection } from "mongodb";
import { z } from "zod";
import "dotenv/config";

// ==================== Cached Resources (created once) ====================

const DB_NAME = "ecommerceDB";

const SYSTEM_PROMPTS = {
  en: `You are a professional shopping assistant for our online store.

ROLE: Help customers find products, answer questions about orders, shipping, and store policies. Be concise, friendly, and helpful — like a real store assistant.

RULES:
- Use the product_search tool whenever customers ask about products, prices, stock, or recommendations.
- Keep responses short and scannable. Use line breaks between products.
- When listing products, use this format for each:

  **Product Name**
  Brief description
  Price: $amount | Stock: X units

- If no results are found, suggest alternative search terms or categories.
- Stay focused on shopping assistance. Politely redirect off-topic questions.
- Never invent products or prices — only use data from the search tool.

STORE POLICIES:
- Free shipping on orders over $100
- Standard delivery: 3-5 business days | Express: 1-2 days (extra cost)
- Returns accepted within 30 days
- Payment: Credit cards, MercadoPago
- Warranty: 1 year (electronics), 6 months (accessories)
- Contact: support@tutienda.com

Current time: {time}`,

  es: `Eres un asistente profesional de compras para nuestra tienda en línea.

ROL: Ayuda a los clientes a encontrar productos, responde preguntas sobre pedidos, envíos y políticas de la tienda. Sé conciso, amigable y útil, como un verdadero asistente de tienda.

REGLAS:
- Usa la herramienta product_search cada vez que los clientes pregunten sobre productos, precios, stock o recomendaciones.
- Mantén las respuestas cortas y fáciles de leer. Usa saltos de línea entre productos.
- Al listar productos, usa este formato para cada uno:

  **Nombre del Producto**
  Breve descripción
  Precio: $monto | Stock: X unidades

- Si no se encuentran resultados, sugiere términos de búsqueda alternativos o categorías.
- Mantente enfocado en asistencia de compras. Redirige cortésmente preguntas fuera de tema.
- Nunca inventes productos o precios — solo usa datos de la herramienta de búsqueda.

POLÍTICAS DE LA TIENDA:
- Envío gratis en pedidos mayores a $100
- Entrega estándar: 3-5 días hábiles | Express: 1-2 días (costo adicional)
- Devoluciones aceptadas dentro de 30 días
- Pago: Tarjetas de crédito, MercadoPago
- Garantía: 1 año (electrónicos), 6 meses (accesorios)
- Contacto: support@tutienda.com

Hora actual: {time}`,
};

function getSystemPrompt(language: string = "es"): string {
  return (
    SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.es
  );
}

// Reusable graph state definition
const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
  }),
});

// Embeddings model (singleton)
let embeddingsModel: GoogleGenerativeAIEmbeddings | null = null;
function getEmbeddingsModel(): GoogleGenerativeAIEmbeddings {
  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY!,
      model: "gemini-embedding-001",
    });
  }
  return embeddingsModel;
}

// Prompt template (now accepts language parameter)
function getPromptTemplate(language: string = "es"): ChatPromptTemplate {
  const systemPrompt = getSystemPrompt(language);
  return ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
  ]);
}

// ==================== Retry Logic ====================

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        console.warn(
          `Rate limit hit. Retry ${attempt}/${maxRetries} in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// ==================== Tool Factory ====================

function createProductSearchTool(collection: Collection) {
  const vectorStore = new MongoDBAtlasVectorSearch(getEmbeddingsModel(), {
    collection: collection,
    indexName: "vector_index",
    textKey: "embedding_text",
    embeddingKey: "embedding",
  } as any);

  return tool(
    async ({ query, n = 5 }: { query: string; n?: number }) => {
      try {
        // Vector search (primary)
        const results = await vectorStore.similaritySearchWithScore(query, n);

        if (results.length > 0) {
          return JSON.stringify({
            results: results,
            searchType: "vector",
            query,
            count: results.length,
          });
        }

        // Text search (fallback)
        const textResults = await collection
          .find({
            $or: [
              { name: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { category: { $regex: query, $options: "i" } },
            ],
          })
          .limit(n)
          .toArray();

        return JSON.stringify({
          results: textResults,
          searchType: "text",
          query,
          count: textResults.length,
        });
      } catch (error: any) {
        console.error("Product search error:", error.message);
        return JSON.stringify({
          error: "Search temporarily unavailable",
          query,
        });
      }
    },
    {
      name: "product_search",
      description:
        "Search for products in the store by name, category, or description. Use this whenever the customer asks about products, prices, or availability.",
      schema: z.object({
        query: z.string().describe("Search query for products"),
        n: z
          .number()
          .optional()
          .default(5)
          .describe("Number of results (default 5)"),
      }),
    },
  );
}

// ==================== Main Agent Function ====================

export async function callAgent(
  client: MongoClient,
  query: string,
  thread_id: string,
  language: string = "es",
) {
  try {
    const collection = client.db(DB_NAME).collection("products");
    const searchTool = createProductSearchTool(collection);
    const tools = [searchTool];

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.3,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY!,
    }).bindTools(tools);

    // Tool executor: invokes tools requested by the model
    async function executeTools(state: typeof GraphState.State) {
      const lastMessage = state.messages[
        state.messages.length - 1
      ] as AIMessage;
      const toolCalls = lastMessage.tool_calls ?? [];
      const toolMap = new Map([["product_search", searchTool]]);

      const toolMessages = await Promise.all(
        toolCalls.map(async (tc) => {
          const fn = toolMap.get(tc.name);
          const result = fn
            ? await fn.invoke(tc.args as { query: string; n?: number })
            : `Unknown tool: ${tc.name}`;
          return new ToolMessage({
            content: String(result),
            tool_call_id: tc.id!,
          });
        }),
      );
      return { messages: toolMessages };
    }

    function shouldContinue(state: typeof GraphState.State) {
      const lastMessage = state.messages[
        state.messages.length - 1
      ] as AIMessage;
      return lastMessage.tool_calls?.length ? "tools" : "__end__";
    }

    async function callModel(state: typeof GraphState.State) {
      return retryWithBackoff(async () => {
        const prompt = getPromptTemplate(language);
        const formattedPrompt = await prompt.formatMessages({
          time: new Date().toISOString(),
          messages: state.messages,
        });
        const result = await model.invoke(formattedPrompt);
        return { messages: [result] };
      });
    }

    const workflow = new StateGraph(GraphState)
      .addNode("agent", callModel)
      .addNode("tools", executeTools)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent");

    const checkpointer = new MongoDBSaver({
      client: client as any,
      dbName: DB_NAME,
    });
    const app = workflow.compile({ checkpointer });

    const finalState = await app.invoke(
      { messages: [new HumanMessage(query)] },
      { recursionLimit: 10, configurable: { thread_id } },
    );

    const response =
      finalState.messages[finalState.messages.length - 1]?.content ||
      "No response generated";

    return response;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Agent error:", error.message);

    if ("status" in error && (error as any).status === 429) {
      throw new Error(
        "Service temporarily unavailable. Please try again in a moment.",
      );
    } else if ("status" in error && (error as any).status === 401) {
      throw new Error("Authentication error. Please contact support.");
    }
    throw new Error(`Assistant unavailable: ${error.message}`);
  }
}
