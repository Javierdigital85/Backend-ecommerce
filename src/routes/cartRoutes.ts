import express from "express";
import * as cartController from "../controllers/cartController";
const router = express.Router();

//rutas que verifican que el usuario acceda solo a su propio carrito
router.get("/get/:userId", cartController.getCart);
router.get("/total/:userId", cartController.getCartTotal);
router.put("/update/:userId", cartController.updateCart);
router.delete("/removeProduct/:userId", cartController.removeProductFromCart);
router.delete("/clear/:userId", cartController.clearCart);
//Ruta para agregar al carrito (no necesita userId)
router.post("/add", cartController.addToCart);

export default router