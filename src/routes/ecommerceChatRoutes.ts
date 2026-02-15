import express, { Request, Response } from "express";
import { callAgent } from "../agent/agent";
import { getMongoClient } from "../config/configdb";

const router = express.Router();

// Validate message from request body
function validateMessage(body: any): string | null {
  const message = body?.message;
  if (!message || typeof message !== "string" || !message.trim()) {
    return null;
  }
  // Limit message length to prevent abuse
  return message.trim().slice(0, 1000);
}

router.post("/chat", async (req: Request, res: Response) => {
  const message = validateMessage(req.body);
  if (!message) {
    res
      .status(400)
      .json({ error: "Message is required and must be a non-empty string." });
    return;
  }

  const language = req.body?.language || "es"; // Default to Spanish
  const threadId = Date.now().toString();

  try {
    const mongoClient = getMongoClient();
    const response = await callAgent(mongoClient, message, threadId, language);
    res.json({ threadId, response });
  } catch (error: any) {
    console.error("Chat error:", error.message);
    const statusCode = error.message?.includes("rate limit") ? 429 : 500;
    res.status(statusCode).json({
      error:
        statusCode === 429
          ? "Too many requests. Please wait a moment and try again."
          : "Our assistant is temporarily unavailable. Please try again shortly.",
    });
  }
});

router.post("/chat/:threadId", async (req: Request, res: Response) => {
  const threadId = req.params.threadId as string;
  const message = validateMessage(req.body);
  if (!message) {
    res
      .status(400)
      .json({ error: "Message is required and must be a non-empty string." });
    return;
  }

  const language = req.body?.language || "es"; // Default to Spanish

  try {
    const mongoClient = getMongoClient();
    const response = await callAgent(mongoClient, message, threadId, language);
    res.json({ response });
  } catch (error: any) {
    console.error("Chat error:", error.message);
    const statusCode = error.message?.includes("rate limit") ? 429 : 500;
    res.status(statusCode).json({
      error:
        statusCode === 429
          ? "Too many requests. Please wait a moment and try again."
          : "Our assistant is temporarily unavailable. Please try again shortly.",
    });
  }
});

export default router;
