import { MongoClient } from "mongodb";
import { callAgent } from "./agent/agent";
import "dotenv/config";

async function testAgent() {
  const client = new MongoClient(process.env.MONGO_DB_URI as string);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    // Pruebas del agente (una sola para evitar rate limits)
    const testQueries = [
      "¿Qué productos tienes disponibles?"
      // "Busco una consola de videojuegos",
      // "¿Cuál es el precio del Nintendo Switch?",
      // "Recomiéndame productos de tecnología",
      // "¿Hay productos en stock?"
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Pregunta: "${query}"`);
      console.log("⏳ Procesando...\n");
      
      try {
        const response = await callAgent(client, query, Date.now().toString());
        console.log(`🤖 Respuesta: ${response}`);
        console.log("─".repeat(80));
      } catch (error) {
        console.error(`❌ Error: ${error}`);
        console.log("─".repeat(80));
      }
    }
    
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await client.close();
    console.log("\n✅ Test completed");
  }
}

testAgent().catch(console.error);