import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { z } from "zod";
import "dotenv/config";

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
        console.error(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function callAgent(
  client: MongoClient,
  query: string,
  thread_id: string,
) {
  try {
    const dbName = "ecommerceDB";
    const db = client.db(dbName);
    const collection = db.collection("products");

    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    });

    const itemLookupTool = tool(
      async ({ query, n = 10 }) => {
        try {
          console.log("Item lookup tool called with query:", query);
          const totalCount = await collection.countDocuments();
          console.log(`Total documents in collection: ${totalCount}`);

          if (totalCount === 0) {
            console.log("Collection is empty");
            return JSON.stringify({
              error: "No items found in inventory",
              message: "The inventory database appears to be empty",
              count: 0,
            });
          }

          const sampleDocs = await collection.find({}).limit(3).toArray();
          console.log("Sample documents:", sampleDocs);

          const dbConfig = {
            collection: collection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          };

          const vectorStore = new MongoDBAtlasVectorSearch(
            new GoogleGenerativeAIEmbeddings({
              apiKey: process.env.GOOGLE_API_KEY!,
              model: "text-embedding-004",
            }),
            dbConfig as any,
          );
          console.log("Performing vector search...");
          const result = await vectorStore.similaritySearchWithScore(query, n);

          console.log(`Vector search returned ${result.length} results`);

          if (result.length === 0) {
            console.log(
              "Vector search returned no results, trying text search...",
            );

            const textResults = await collection
              .find({
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { description: { $regex: query, $options: "i" } },
                  { category: { $regex: query, $options: "i" } },
                  { embedding_text: { $regex: query, $options: "i" } },
                ],
              })
              .limit(n)
              .toArray();

            console.log(`Text search returned ${textResults.length} result`);

            return JSON.stringify({
              results: textResults,
              searchType: "text",
              query: query,
              count: textResults.length,
            });
          }

          return JSON.stringify({
            results: result,
            searchType: "vector",
            query: query,
            count: result.length,
          });
        } catch (error: any) {
          console.error("Error in item lookup:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
          return JSON.stringify({
            error: "Failed to search inventory",
            details: error.message,
            query: query,
          });
        }
      },
      {
        name: "product_search",
        description: "Searches for products in the e-commerce store database",
        schema: z.object({
          query: z.string().describe("The search query"),
          n: z
            .number()
            .optional()
            .default(10)
            .describe("Number of results to return"),
        }),
      },
    );

    const tools = [itemLookupTool];

    // Manual tool execution function
    async function executeTools(state: typeof GraphState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        const toolResults = [];

        for (const toolCall of lastMessage.tool_calls) {
          if (toolCall.name === "product_search") {
            const args = {
              query: toolCall.args.query || "",
              n: toolCall.args.n || 10,
            };
            const result = await itemLookupTool.func(args);
            toolResults.push({
              tool_call_id: toolCall.id,
              content: result,
            });
          }
        }

        return {
          messages: toolResults.map((result) => ({
            type: "tool",
            content: result.content,
            tool_call_id: result.tool_call_id,
          })),
        };
      }

      return { messages: [] };
    }

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.3,
      maxRetries: 0,
      apiKey: process.env.GOOGLE_API_KEY!,
    }).bindTools(tools);

    function shouldContinue(state: typeof GraphState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      return "__end__";
    }

    async function callModel(state: typeof GraphState.State) {
      return retryWithBackoff(async () => {
        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system",
            `You are a helpful E-commerce Assistant for an online store.

          LANGUAGE REQUIREMENT (CRITICAL): 
          - ALWAYS respond EXCLUSIVELY in the SAME language the customer uses to ask their question
          - If the customer asks in English, respond ONLY in English, including product descriptions
          - If the customer asks in Spanish, respond ONLY in Spanish, including product descriptions
          - If the customer asks in French, German, or Portuguese, respond in that language only
          - NEVER mix languages in a single response
          - NEVER provide any part of the response in a different language than the customer's question
          - When you retrieve product descriptions from the database that are in a different language, ALWAYS translate or reformulate them into the customer's language
          - This applies to ALL product information, descriptions, characteristics, and details

          RESPONSE FORMAT - MANDATORY RULES (FOLLOW EXACTLY): 
          - NEVER write products in a single continuous line
          - ALWAYS add line breaks after each piece of information
          - MANDATORY: Add TWO line breaks between each product
          - MANDATORY: Add TWO line breaks between each section
          - Format MUST be exactly:

          Section Header (like "ELECTRIC GUITARS")
          
          
          Product Name
          Short description (max 10 words)
          Price: $amount
          Stock: X units available
          
          
          Next Product Name
          Short description (max 10 words)
          Price: $amount
          Stock: X units available
          
          
          CRITICAL: If you don't follow this exact format with proper line breaks, the response will be unreadable. Always ensure proper spacing and line breaks between ALL elements.

          IMPORTANT: You have access to a product search tool that searches the store's product database. Always use this tool when customers ask about products, prices, availability, or recommendations.

          STORE INFORMATION:
          - We offer shipping worldwide
          - Free shipping on orders over $100
          - Standard delivery: 3-5 business days
          - Express delivery: 1-2 business days (additional cost)
          - We accept returns within 30 days
          - Customer service available 24/7
          - Payment methods: Credit cards, MercadoPago
          - Store hours: Monday to Friday 9AM-6PM
          - Contact: support@tutienda.com
          - Warranty: 1 year on electronics, 6 months on accessories
          - Installation service available for TVs and appliances
          - DISCOUNTS: We currently do not offer regular discounts or promotions. All prices shown are final prices.

          When using the product search tool:
          - If it returns results, provide helpful details about the products including name, description, price, and stock
          - If it returns an error or no results, acknowledge this and suggest alternative searches or categories
          - If the database appears to be empty, let customers know that products might be being updated

          You can help customers with:
          - Finding specific products
          - Product recommendations
          - Price information
          - Stock availability
          - Product comparisons
          - Shipping information
          - Return policies
          - General shopping assistance

          Current time: {time}`,
          ],
          new MessagesPlaceholder("messages"),
        ]);

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

    const checkPointer = new MongoDBSaver({ client: client as any, dbName });

    const app = workflow.compile({ checkpointer: checkPointer });

    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(query)],
      },
      {
        recursionLimit: 15,
        configurable: { thread_id: thread_id },
      },
    );
    const response =
      finalState.messages[finalState.messages.length - 1]?.content ||
      "No response generated";

    console.log("Agent response:", response);

    return response;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Error in callAgent", error.message);

    if ("status" in error && error.status === 429) {
      throw new Error(
        "Service temporarily unavailable due to rate limits.Please try again in a minute",
      );
    } else if ("status" in error && error.status === 401) {
      throw new Error(
        "Authentication failed. Please check your API configuration.",
      );
    } else {
      throw new Error(`Agent failed: ${error.message}`);
    }
  }
}
