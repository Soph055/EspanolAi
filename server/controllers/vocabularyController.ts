import { Request, Response } from "express";
import db from "../db/db";
import { z } from "zod";
import logger from "../lib/logger";

// Validation schema for adding/updating a word
const vocabularySchema = z.object({
    word: z.string().trim().min(1, "Word cannot be empty").max(100),
    translation: z.string().trim().min(1, "Translation cannot be empty").max(100),
});

// -------- Add Vocabulary --------
// Inserts a new word-translation pair for the logged-in user.
// Returns the full new row so the frontend can display it immediately.
export const addVocabulary = async (req: Request, res: Response): Promise<Response> => {
    const parsed = vocabularySchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const userId = req.user?.id;
    const { word, translation } = parsed.data;

    try {
        const result = await db.query(
            `INSERT INTO vocabulary (user_id, word, translation) VALUES ($1, $2, $3) RETURNING *`,
            [userId, word, translation]
        );

        return res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error("[vocabularyController.addVocabulary]", err);
        return res.status(500).json({ message: "Failed to add new vocabulary word" });
    }
};

// -------- Get All Vocabulary --------
// Returns all vocabulary words for the logged-in user, sorted alphabetically.
// Empty array is a valid response if the user has no words yet.
export const getAllWords = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    try {
        const result = await db.query(
            `SELECT * FROM vocabulary WHERE user_id = $1 ORDER BY word ASC`,
            [userId]
        );

        return res.status(200).json(result.rows);
    } catch (err) {
        logger.error("[vocabularyController.getAllWords]", err);
        return res.status(500).json({ message: "Failed to retrieve vocabulary words" });
    }
};

// -------- Delete Vocabulary --------
// Deletes a specific word. The WHERE clause includes user_id to enforce ownership -
// if the word doesn't belong to this user, rowCount will be 0 and we return 404.
export const deleteVocabulary = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const id = req.params.id;

    try {
        const result = await db.query(
            `DELETE FROM vocabulary WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        // 404 (not 403) to hide whether the word exists from unauthorized users
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Vocabulary word not found" });
        }

        return res.status(200).json({ message: "Word deleted" });
    } catch (err) {
        logger.error("[vocabularyController.deleteVocabulary]", err);
        return res.status(500).json({ message: "Could not delete vocabulary word" });
    }
};