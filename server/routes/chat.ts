import express from "express";
import * as chatController from "../controllers/chatController";
import requireAuth from "../middleware/authMiddleware";

const router = express.Router();

// Create new conversation
router.post("/conversations", requireAuth, chatController.createConversation);

// List all existing conversations for the user
router.get("/conversations", requireAuth, chatController.getConversations);

// Get all messages for a specific conversation
router.get("/conversations/:id/messages", requireAuth, chatController.getAllMessages);

// Send a new chat message and get the AI response (uses full history for context)
router.post("/conversations/:id/messages", requireAuth, chatController.sendMessage);

// Delete a conversation (messages cascade automatically via FK)
router.delete("/conversations/:id", requireAuth, chatController.deleteConversation);

export default router;