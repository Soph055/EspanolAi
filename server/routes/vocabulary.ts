import express from "express";
import * as vocabularyController from "../controllers/vocabularyController";
import requireAuth from "../middleware/authMiddleware";

const router = express.Router();

// Add a vocabulary word for the logged-in user
router.post("/", requireAuth, vocabularyController.addVocabulary);

// Get all vocabulary words for the logged-in user (alphabetical)
router.get("/", requireAuth, vocabularyController.getAllWords);

// Delete a specific vocabulary word (ownership enforced in controller)
router.delete("/:id", requireAuth, vocabularyController.deleteVocabulary);

export default router;