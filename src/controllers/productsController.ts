import { RequestHandler } from "express";
import { productSchema } from "../schemas/productSchema";
import ProductModel from "../models/ProductModel";
import { ZodError } from "zod";

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const { name, description, price, stock, images, videoUrl, videoSource } = productSchema.parse(
      req.body
    );

    const newProduct = await ProductModel.create({
      name,
      description,
      price,
      stock,
      images,
      ...(videoUrl !== undefined && { videoUrl }),
      ...(videoSource !== undefined && { videoSource }),
    });

    res
      .status(201)
      .json({ product: newProduct, message: "Producto creado existosamente" });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res
      .status(500)
      .json({ message: "Error al crear el producto", error: error });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  try {
    //1. validar los datos de entrada con Zod
    const validateData = productSchema.partial().parse(req.body);

    //2 Buscar y actualizar el producto
    const updateProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      validateData,
      { new: true, runValidators: true }
    );
    //3 Validar si el producto existe
    if (!updateProduct) {
      res.status(404).json({ message: " Producto no encontrado" });
    }
    //4 Devolver el producto actualizado
    res.status(200).json({
      product: updateProduct,
      message: "Producto actualizado existosamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

export const getProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const findProduct = await ProductModel.findById(id);

    if (!findProduct) {
      return res.status(404).json({ message: "Este producto no existe" });
    }
    res
      .status(200)
      .json({ message: "Producto encontrado", product: findProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al buscar producto por Id", error: error });
  }
};

export const getAllProducts: RequestHandler = async (req, res) => {
  try {
    const getAllProducts = await ProductModel.find();
    res.status(200).json({ products: getAllProducts });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener todos los productos" });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await ProductModel.findByIdAndDelete(id);

    if (!deleteProduct) {
      return res.status(404).json({
        message: "No se encontro el producto para eliminar",
        product: deleteProduct,
      });
    }
    res
      .status(200)
      .json({ message: "producto eliminado", producto: deleteProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
};
export const applyDiscount: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercentage } = req.body;

    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ message: "El descuento debe estar entre 0 y 100" });
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { discountPercentage },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ 
      message: "Descuento aplicado exitosamente", 
      product 
    });
  } catch (error) {
    res.status(500).json({ message: "Error al aplicar descuento" });
  }
};