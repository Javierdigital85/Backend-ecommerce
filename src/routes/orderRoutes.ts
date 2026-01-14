import express from "express";
import * as orderController from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Crear nueva orden de compra y generar preferencia de pago de MP (requiere autenticación)
router.post("/create", authMiddleware, orderController.createOrder);

export default router;
