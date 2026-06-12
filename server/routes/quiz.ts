import express from "express";
import requireAuth from "../middleware/authMiddleware";
import * as quizController from  "../controllers/quizController"; 


const router = express.Router();
//Generates new quiz
router.post("/", requireAuth, quizController.createQuiz);
export default router;
