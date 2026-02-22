import express from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.loginUser);

router.post("/logout", authController.logout);

router.put("/updateUser/:id", authController.updateUser);

router.get("/profile", authMiddleware, authController.profile);

router.get("/users", authMiddleware, authController.getUsers);

export default router;

//req nos sirve para extraer información del cliente req.body, req.params, req.query, req.cookies, req.headers, req.user
//res nos sirve para enviar información al cliente res.send, res.json, res.status, res.cookie, res.clearCookie, res.redirect, res.render, res.sendFile
