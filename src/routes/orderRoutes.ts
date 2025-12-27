import express from "express";
import * as orderController from "../controllers/orderController"

const router = express.Router();

// Crear nueva orden de compra.y generar preferencia de pago de MP
router.post("/create", orderController.createOrder);

export default router;
