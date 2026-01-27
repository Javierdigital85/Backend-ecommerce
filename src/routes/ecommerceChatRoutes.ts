import express, { Request, Response } from "express";
import { callAgent } from "../agent/agent";
import { getMongoClient } from "../config/configdb";

const router = express.Router();

router.post("/chat", async (req: Request, res: Response) => {
  const initialMessage = req.body.message;
  const threadId = Date.now().toString();
  console.log(initialMessage);
  try {
    const mongoClient = getMongoClient();
    const response = await callAgent(mongoClient, initialMessage, threadId);
    res.json({ threadId, response });
  } catch (error) {
    console.error("Error starting conversation", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chat/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const { message } = req.body;
  try {
    const mongoClient = getMongoClient();
    const response = await callAgent(mongoClient, message, threadId!);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
