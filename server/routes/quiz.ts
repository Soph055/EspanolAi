import express from "express";
import requireAuth from "../middleware/authMiddleware";
import * as quizController from  "../controllers/quizController"; 


const router = express.Router();
//Generates new quiz
router.post("/", requireAuth, quizController.createQuiz);

//quiz results 
router.post("/result", requireAuth, quizController.submitQuiz);
export default router;
