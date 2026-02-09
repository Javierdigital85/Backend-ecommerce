import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGO_DB_URI as string);

async function setupDatabaseAndCollection(): Promise<void> {
  console.log("Setting up database and collection...");
  const db = client.db("ecommerceDB");

  const collection = await db.listCollections({ name: "products" }).toArray();

  if (collection.length === 0) {
    console.log(
      "Products collection doesn't exist. Please run the e-commerce seed first.",
    );
    return;
  } else {
    console.log("'products' collection found in 'ecommerceDB' database");
  }
}

async function createVectorSearchIndex(): Promise<void> {
  try {
    const db = client.db("ecommerceDB");
    const collection = db.collection("products");

    // Drop existing vector index if it exists (needed when changing dimensions)
    try {
      const indexes = await collection.listSearchIndexes().toArray();
      const existingIdx = indexes.find(
        (idx: any) => idx.name === "vector_index",
      );
      if (existingIdx) {
        console.log("Dropping existing vector search index...");
        await collection.dropSearchIndex("vector_index");
        // Wait for index to be fully dropped
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Old vector search index dropped");
      }
    } catch (e) {
      console.log("No existing vector index to drop (or already dropped)");
    }

    const vectorSearchIdx = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 3072,
            similarity: "cosine",
          },
        ],
      },
    };
    console.log("Creating vector search index with 3072 dimensions...");
    await collection.createSearchIndex(vectorSearchIdx);
    console.log("Successfully created vector search index");
  } catch (error) {
    console.error("Failed to create vector search index:", error);
  }
}

async function addEmbeddingsToProducts(): Promise<void> {
  try {
    const db = client.db("ecommerceDB");
    const collection = db.collection("products");

    // Clear old embeddings (needed when switching models/dimensions)
    await collection.updateMany(
      { embedding: { $exists: true } },
      { $unset: { embedding: "", embedding_text: "" } },
    );
    console.log("Cleared old embeddings");

    const products = await collection.find({}).toArray();
    console.log(`Found ${products.length} products to process`);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY!,
      model: "gemini-embedding-001",
    });

    for (const product of products) {
      const summary = `${product.name} ${product.description} Category: ${product.category} Price: $${product.price}`;

      // Generate embedding for the product
      const embedding = await embeddings.embedQuery(summary);

      // Update the existing product with embedding
      await collection.updateOne(
        { _id: product._id },
        {
          $set: {
            embedding: embedding,
            embedding_text: summary,
          },
        },
      );

      console.log(`Processed product: ${product.name}`);
    }

    console.log("Embeddings added to all products");
  } catch (error) {
    console.error("Error adding embeddings:", error);
  }
}

async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB");

    await setupDatabaseAndCollection();
    await createVectorSearchIndex();
    await addEmbeddingsToProducts();

    console.log(
      "Chat setup completed - products now have embeddings for search",
    );
  } catch (error) {
    console.error("Error setting up chat:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
