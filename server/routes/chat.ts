import express from "express";
import * as chatController from "../controllers/chatController";
import requireAuth from "../middleware/authMiddleware";

const router = express.Router();

router.post("/conversations", requireAuth, chatController.createConversation);

// returns and lists  all existing conversations for user
router.get("/conversations", requireAuth, chatController.getConversations);

export default router;


 //get all exisiting chat messages for a conversation 
 router.get("/conversations/:id/messages", requireAuth, chatController.getAllMessages);

 //router.get("/conversations/:id/messages", requireAuth);


 //delete chat
