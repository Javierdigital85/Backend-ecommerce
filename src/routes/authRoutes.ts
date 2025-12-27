import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.loginUser);

router.post("/logout", authController.logout);

router.get("/profile", authController.profile);

export default router;

//req nos sirve para extraer información del cliente req.body, req.params, req.query, req.cookies, req.headers, req.user
//res nos sirve para enviar información al cliente res.send, res.json, res.status, res.cookie, res.clearCookie, res.redirect, res.render, res.sendFile
