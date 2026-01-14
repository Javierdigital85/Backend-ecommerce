import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../interfaces";
import UserModel from "../models/UserModel";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    // Extraer el token de la cookie
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado. Por favor inicia sesión.",
      });
    }

    // Verificar el token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Buscar el usuario en la base de datos
    const user = await UserModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Agregar el usuario al objeto req
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expirado. Por favor inicia sesión nuevamente.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error al verificar autenticación",
    });
  }
};
