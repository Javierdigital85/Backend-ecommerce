import express from "express";
import * as productsController from "../controllers/productsController";
const router = express.Router();

//Rutas publicas
router.get("/", productsController.getAllProducts);

router.get("/:id", productsController.getProductById);

//Rutas protegias donde solo el admin puede modificar los productos
router.post("/", productsController.createProduct); //crear producto
router.put("/:id", productsController.updateProduct); //actualizar producto
router.delete("/:id", productsController.deleteProduct); //eliminar producto

export default router;
