import { RequestHandler } from "express";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import UserModel from "../models/UserModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

export const register: RequestHandler = async (req, res) => {
  try {
    console.log(req.body);
    //Trae la clave secreta de JWT
    const JWT_SECRET = process.env.JWT_SECRET;

    //Extraer los datos del usuario
    const { username, email, password } = registerSchema.parse(req.body);

    // Comprobar si ya existe el usuario
    const existingUser = await UserModel.findOne({
      email,
    });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }
    //Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    //Comprobar el usuario admin
    const isFirstUser = (await UserModel.countDocuments()) === 0;

    //Crear el usuario y gaurdar en la base de datos

    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: isFirstUser,
    });

    //Generar un token con JWT

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    //agregamos el userId al payload
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    //header.payload.signature

    // Eliminar el password del usuario
    const { password: _, ...user } = newUser.toObject();
    //Enviar el token como una cookie
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true enviamos el token a travez de https
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000, //1 hora
      })
      .status(201)
      .json({ message: "Usuario registrado con éxito", newUser: user });

    console.log(user);
    // res.json({ newUser: newUser });
  } catch (error) {
    res.status(400).json({ error: "Error en el registro", details: error });
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  try {
    //Obtener la clave secreta del entorno
    const JWT_SECRET = process.env.JWT_SECRET;

    //Extraer el email y password del cuerpo de la petición
    //ademas validarlos
    const { email, password } = loginSchema.parse(req.body);

    //
    const user = await UserModel.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({ message: "Credenciales invalidas" });
    }

    //Comparar las contraseñas
    const isPasswordIsValid = await bcrypt.compare(password, user.password);

    if (!isPasswordIsValid) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    //Generar un token con JWT
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000,
      })
      .status(200)
      .json(userData);
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).json({ message: "Error al iniciar sesión", error: error });
  }
};

export const profile: RequestHandler = async (req, res) => {
  try {
    // El middleware authMiddleware ya verificó el token y agregó req.user
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    res.status(200).json({
      id: req.user._id,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      username: req.user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil", error });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(200)
      .json({ message: "Cierre de sesión exitoso" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión", error: error });
  }
};
