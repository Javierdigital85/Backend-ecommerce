import CartModel from "../models/CartModel";
import ProductModel from "../models/ProductModel";
import { IProduct } from "../interfaces";
import { RequestHandler } from "express";

export const addToCart: RequestHandler = async (req, res) => {
  try {
    // userId puede venir en el body o en el user del req
    const userId = req.user?._id || req.body.userId;
    // productId es requerido y quantity es opcional
    const { productId, quantity = 1 } = req.body;
    //Validar que se proporciono el userId
    if (!userId) {
      return res.status(400).json({ message: "El userId es requerido" });
    }
    //Validar que se proporciono el productId
    if (!productId) {
      return res.status(400).json({ message: "El producto es requerido" });
    }
    //Validar que la cantidad sea al menos 1
    if (quantity < 1) {
      return res
        .status(400)
        .json({ message: "La cantidad debe ser al menos 1" });
    }

    const product = await ProductModel.findById(productId);
    //Validar que el producto existe
    if (!product) {
      return res.status(400).json({ message: "Producto no encontrado" });
    }

    let cart = await CartModel.findOne({ userId });
    //Verificar si el usuario ya tiene un carrito
    if (cart) {
      console.log("Usuario tiene carrito");
      // productId contiene la posicion del producto en el carrito
      const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
      );

      //Verificar stock
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Solo hay ${product.stock} de unidades disponibles`,
        });
      }

      //QUE HAY COINCIDENCIA
      if (productIndex > -1) {
        //PRODUCTO YA EXISTE EN CARRITO DEL USUARIO SOLO ACTUALIZAR LA CANTIDAD
        cart.products[productIndex]!.quantity += quantity;
      } else {
        console.log("Agregando nuevo producto al carrito existente");
        cart.products.push({ productId, quantity });
      }
    } else {
      //SI NO EXISTE EL CARRITO
      cart = new CartModel({
        userId,
        products: [{ productId, quantity }],
      });
    }

    //GUARDAR EL CARRITO DE COMPRAS
    await cart.save();

    //OPTIONAL
    await cart.populate("products.productId");

    // DEVOLVEMOS EL CARRITO ACTULIZADO
    res.status(200).json({
      message: "Producto agregado al carrito",
      cart,
    });
  } catch (error) {
    res.json({ message: "ERROR" });
  }
};

export const getCart: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "El userId es requerido" });
    }
    const cart = await CartModel.findOne({ userId }).populate(
      "products.productId"
    );
    if (cart) {
      res.status(200).json({
        message: "Carrito obtenido con exito",
        cart,
      });
    } else {
      res.status(404).json({ message: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error del servidor al obtener el carrito",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateCart: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    console.log("UPDATE CART", productId, quantity);

    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex > -1) {
      const product = await ProductModel.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Producto no encontrado",
        });
      }
      //Verificar que la cantidad no exeda el stock disponible
      if (quantity > product.stock) {
        return res.status(400).json({
          message: `Solo hay ${product.stock} unidades disponibles`,
        });
      }

      const cartProduct = cart.products[productIndex];
      if (cartProduct) {
        cartProduct.quantity = quantity;
      }

      await cart.save();

      res.status(200).json({
        message: "Carrito actualizado con èxito",
        cart,
      });
    } else {
      res.status(404).json({
        message: "Producto no encontrado en el carrito",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error del servidor al actualizar el carrito",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const removeProductFromCart: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    //Validar que se proporciono el userId
    if (!userId) {
      return res.status(400).json({ message: "El userId es requerido" });
    }

    //Validar que el carrito existe
    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    //Buscar el indice del producto en el carrito
    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    //Verificar si el producto existe en el carrito
    if (productIndex > -1) {
      //Eliminar el producto del carrito
      cart.products.splice(productIndex, 1);

      //Guardar cambios en el carrito
      await cart.save();

      //Devolver el carrito actualizado
      res.status(200).json({
        message: "Producto eliminado del carrito con éxito",
        cart,
      });
    } else {
      res.status(404).json({
        message: "Producto no encontrado en el carrito",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error del servidor al eliminar el producto del carrito",
    });
  }
};

export const clearCart: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }

    const cart = await CartModel.findOne({ userId });

    if (cart) {
      cart.products.splice(0, cart.products.length);
      await cart.save();
      res.status(200).json({
        message: "Carrito vaciado con éxito",
        cart,
      });
    } else {
      res.status(404).json({
        message: "Carrito no encontrado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error del servidor al eliminar un producto",
    });
  }
};

export const getCartTotal: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        message: "El user es requirid",
      });
    }

    const cart = await CartModel.findOne({ userId }).populate(
      "products.productId"
    );

    if (!cart) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    if (cart) {
      const total = cart.products.reduce((acc, item) => {
        const product = item.productId as IProduct;
        return acc + product.price * item.quantity;
      }, 0);
      res.status(200).json({
        message: "Total obtenido con éxito",
        total,
      });
    } else {
      res.status(404).json({ message: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error del servidor al obtener el total",
    });
  }
};
