import mongoose from "mongoose";
import { MongoClient } from "mongodb";

let mongoClient: MongoClient | null = null;

export const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_DB_URI ?? "";
    console.log("Estas es la db-URI", dbURI);

    await mongoose.connect(dbURI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.log("Error al conectarse a MongoDB", error);
  }
};

export const connectMongoClient = async () => {
  try {
    const dbURI = process.env.MONGO_DB_URI ?? "";
    mongoClient = new MongoClient(dbURI);
    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    console.log("MongoDB Client conectado para el agente");
    return mongoClient;
  } catch (error) {
    console.log("Error al conectar MongoDB Client", error);
    throw error;
  }
};

export const getMongoClient = () => {
  if (!mongoClient) {
    throw new Error("MongoDB Client no está conectado");
  }
  return mongoClient;
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
    }
    console.log("Base de datos MongoDB desconectada");
  } catch (error) {
    console.log("Error al desconectar desde MongoDB", error);
  }
};
