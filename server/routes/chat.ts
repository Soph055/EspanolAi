import express from "express";
import * as chatController from "../controllers/chatController";
import requireAuth from "../middleware/authMiddleware";

const router = express.Router();

router.post("/conversations", requireAuth, chatController.createConversation);

export default router;
 //get exisiting chat
 //router.get("/conversations", requireAuth, );

 //router.get("/conversations/:id/messages", requireAuth);


 //delete chat
