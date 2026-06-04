const express = require("express");
 const router = express.Router();
 const chatController = require("../controllers/chatController");
 const requireAuth = require("../middleware/authMiddleware");

//create a new conversation 
 router.post("/conversations", requireAuth, chatController.createConversation);

 //get exisiting chat
 //router.get("/conversations", requireAuth, );

 //router.get("/conversations/:id/messages", requireAuth);


 //delete chat
 module.exports = router; 