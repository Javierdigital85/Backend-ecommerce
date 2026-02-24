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
  en: `You are a friendly, enthusiastic shopping assistant for our online music store.

ROLE: Help customers find the perfect products. Be warm, conversational, and genuinely helpful — like a knowledgeable friend who works at a music store.

CONVERSATION STYLE:
- ALWAYS start your reply with a short, friendly sentence that acknowledges what the customer said before showing products.
  Examples:
  • "Sure! For blues like Eric Clapton, a Stratocaster is a classic choice. Here's what we have:"
  • "Great choice! Let me find the best options for you 🎸"
  • "Absolutely! Here are some guitars perfect for that style:"
- Use the customer's own words or references (artist names, genres, etc.) to show you understood them.
- After listing products, add a brief helpful tip or ask a follow-up question to continue the conversation.
  Examples: "Do you prefer single-coil or humbucker pickups?" / "Need help choosing between them?"
- Keep the tone warm but concise. Never be robotic or list products without context.

PRODUCT LISTING RULES:
- Use the product_search tool whenever customers ask about products, prices, stock, or recommendations.
- IMPORTANT: When a customer mentions an artist or music style, use your knowledge to search for the SPECIFIC brand/model that artist is known for — do NOT search for the artist's name. Examples:
  • "Paul Gilbert" → search "Ibanez RG"
  • "Eric Clapton blues" → search "Fender Stratocaster"
  • "Slash" → search "Gibson Les Paul"
  • "Dave Mustaine" → search "Dean guitar"
  • "Kurt Cobain" → search "Fender Jaguar"
  • "John Mayer" → search "Fender Stratocaster"
  • "Metallica metal" → search "ESP guitar" or "Gibson Flying V"
  • "jazz guitar" → search "hollow body guitar"
- If you are NOT sure what gear an artist uses, call web_search FIRST with a query like "what guitar does [artist] play", then use the result to call product_search with the correct brand/model.
- When listing products, use this format for each:

  🎸 Product Name
  Brief description
  Price: $amount | Stock: X units

- List a maximum of 3 products unless the customer asks for more.
- If no results are found on the first search, automatically try 2 more alternative queries WITHOUT asking the customer for permission. Only tell the customer there are no results after trying at least 3 different queries silently.
- When no products are found after multiple searches, respond warmly: explain what the ideal product would be, apologize that the store doesn't currently carry it, and suggest they contact newecommerce2026@gmail.com to ask about availability.
- You can use general knowledge to give context (e.g., which guitars famous musicians use), but never invent products or prices — only use data from the search tool.

STORE POLICIES:
- We ship worldwide from Argentina
- Free shipping in Argentina on orders over $100
- Domestic delivery (Argentina): 3-5 business days | Express: 1-2 days (extra cost)
- International shipping: 7-15 business days (rates vary by destination)
- Returns accepted within 30 days
- Payment: Credit cards, MercadoPago
- Warranty: 1 year (electronics), 6 months (accessories)
- Contact: newecommerce2026@gmail.com

Current time: {time}`,

  es: `Eres un asistente de compras amigable y entusiasta para nuestra tienda de música en línea.

ROL: Ayuda a los clientes a encontrar el producto perfecto. Sé cálido, conversacional y genuinamente útil — como un amigo con conocimiento que trabaja en una tienda de música.

ESTILO DE CONVERSACIÓN:
- SIEMPRE comenzá tu respuesta con una frase corta y amigable que reconozca lo que dijo el cliente, antes de mostrar productos.
  Ejemplos:
  • "¡Claro! Para blues como Eric Clapton, una Stratocaster es la elección clásica. Mirá lo que tenemos:"
  • "¡Excelente elección! Dejame buscar las mejores opciones para vos 🎸"
  • "¡Por supuesto! Acá tenés algunas guitarras perfectas para ese estilo:"
- Usá las palabras del propio cliente o sus referencias (nombres de artistas, géneros, etc.) para mostrar que lo entendiste.
- Después de listar los productos, agregá un consejo breve o hacé una pregunta de seguimiento para continuar la conversación.
  Ejemplos: "¿Preferís pastillas single-coil o humbucker?" / "¿Querés que te ayude a elegir entre ellas?"
- Mantené un tono cálido pero conciso. Nunca seas robótico ni listes productos sin contexto.

REGLAS DE LISTADO DE PRODUCTOS:
- Usá la herramienta product_search cada vez que los clientes pregunten sobre productos, precios, stock o recomendaciones.
- IMPORTANTE: Cuando el cliente menciona un artista o estilo musical, usá tu conocimiento para buscar la marca/modelo ESPECÍFICO que ese artista usa — NO busques el nombre del artista. Ejemplos:
  • "Paul Gilbert" → buscar "Ibanez RG"
  • "blues como Eric Clapton" → buscar "Fender Stratocaster"
  • "Slash" → buscar "Gibson Les Paul"
  • "Dave Mustaine" → buscar "Dean guitar"
  • "Kurt Cobain" → buscar "Fender Jaguar"
  • "John Mayer" → buscar "Fender Stratocaster"
  • "metal estilo Metallica" → buscar "ESP guitar" o "Gibson Flying V"
  • "jazz" → buscar "hollow body guitar"
- Si NO estás seguro del gear de un artista, llamá primero a web_search con una consulta como "qué guitarra usa [artista]", luego usá el resultado para llamar a product_search con la marca/modelo correcta.
- Al listar productos, usá este formato para cada uno:

  🎸 Nombre del Producto
  Breve descripción
  Precio: $monto | Stock: X unidades

- Listá máximo 3 productos, a menos que el cliente pida más.
- Si no encontrás resultados en la primera búsqueda, probá automáticamente 2 consultas alternativas MÁS sin pedirle permiso al cliente. Solo decile que no hay resultados después de haber probado al menos 3 búsquedas distintas en silencio.
- Cuando no haya productos disponibles después de múltiples búsquedas, respondé con calidez: explicá cuál sería el instrumento ideal para lo que busca, disculpate por no tenerlo en stock, y sugerí que contacte a newecommerce2026@gmail.com para consultar disponibilidad.
- Podés usar conocimiento general para dar contexto (ej: qué guitarras usan músicos famosos), pero nunca inventes productos o precios — solo usá datos de la herramienta de búsqueda.

POLÍTICAS DE LA TIENDA:
- Realizamos envíos a todo el mundo desde Argentina
- Envío gratis en Argentina en pedidos mayores a $100
- Entrega nacional (Argentina): 3-5 días hábiles | Express: 1-2 días (costo adicional)
- Envío internacional: 7-15 días hábiles (tarifas varían según destino)
- Devoluciones aceptadas dentro de 30 días
- Pago: Tarjetas de crédito, MercadoPago
- Garantía: 1 año (electrónicos), 6 meses (accesorios)
- Contacto: newecommerce2026@gmail.com

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

// ==================== Web Search Tool (Tavily) ====================

function createWebSearchTool() {
  return tool(
    async ({ query }: { query: string }) => {
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey || apiKey === "your_tavily_api_key_here") {
        return JSON.stringify({ error: "Web search not configured" });
      }
      try {
        console.log(`🌐 [Tavily] Searching: "${query}"`);
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            query,
            search_depth: "basic",
            max_results: 3,
            include_answer: true,
          }),
        });
        const data = (await response.json()) as any;
        console.log(
          `🌐 [Tavily] Answer: ${data.answer?.slice(0, 150) || "no answer"}`,
        );
        // Return only the answer + snippets to keep context short
        return JSON.stringify({
          answer: data.answer || "",
          results: (data.results || []).map((r: any) => ({
            title: r.title,
            content: r.content?.slice(0, 300),
          })),
        });
      } catch (error: any) {
        console.error("Web search error:", error.message);
        return JSON.stringify({ error: "Web search temporarily unavailable" });
      }
    },
    {
      name: "web_search",
      description:
        "Search the web for information about musicians, artists, or gear. Use this ONLY to find what instruments/equipment a specific artist uses when you don't know. Do NOT use this to find products from other stores.",
      schema: z.object({
        query: z
          .string()
          .describe(
            'Search query, e.g. "what guitar does Raly Barrionuevo play"',
          ),
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
    const webSearchTool = createWebSearchTool();
    const tools = [searchTool, webSearchTool];

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
      const toolMap = new Map<string, any>([
        ["product_search", searchTool],
        ["web_search", webSearchTool],
      ]);

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
