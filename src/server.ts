import express from "express";
import { connectDB, connectMongoClient, disconnectDB } from "./config/configdb";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import productsRoutes from "./routes/productsRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import ecommerceChatRoutes from "./routes/ecommerceChatRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";

// dotenv lee las varaibles de entorno
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
    credentials: true,
  }),
);
app.use(cookieParser());
// Middleware que permite recibir JSON en el body de las peticiones
app.use(express.json());

const PORT = 3001;

//Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api", ecommerceChatRoutes);
app.use("/api/upload", uploadRoutes);

Promise.all([connectDB(), connectMongoClient()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to databases:", error);
    disconnectDB();
  });
