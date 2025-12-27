import express from "express";
import { connectDB, disconnectDB } from "./config/configdb";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import productsRoutes from "./routes/productsRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
    credentials: true,
  })
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

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    disconnectDB();
  });
