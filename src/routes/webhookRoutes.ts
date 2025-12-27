import express from "express";
import webHoobController from "../controllers/webHookController";

const router = express.Router();

router.post('/',webHoobController)

export default router