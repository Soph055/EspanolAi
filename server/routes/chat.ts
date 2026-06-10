import express from "express";
import * as chatController from "../controllers/chatController";
import requireAuth from "../middleware/authMiddleware";

const router = express.Router();
//create new conversation
router.post("/conversations", requireAuth, chatController.createConversation);

// returns and lists  all existing conversations for user
router.get("/conversations", requireAuth, chatController.getConversations);



 //get all exisiting chat messages for a conversation 
 router.get("/conversations/:id/messages", requireAuth, chatController.getAllMessages);

//send chat message with history and get response 
 router.post("/conversations/:id/messages", requireAuth, chatController.sendMessage);



 //delete chat (need to delete the conversation and all the messages linked to convo)
 router.delete("/conversations/:id/delete");
export default router;