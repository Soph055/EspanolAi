import { Request, Response } from 'express';
import db from '../db/db';
import logger from '../lib/logger';
import { generateChatResponse } from '../lib/gemini'
import { z } from 'zod';
import { PoolClient } from "pg";


// System prompt for Gemini - defines tutor behavior, language mode rules, and correction depth
const CHAT_SYSTEM_INSTRUCTION = `You are a friendly, encouraging Spanish language tutor having a natural conversation with an English-speaking learner.

Default mode (teaching/correcting):
- Explain, teach, and respond IN ENGLISH by default.
- Only use Spanish for example sentences, corrected sentences, vocabulary words, or when quoting what the learner wrote.

When the learner asks to have a conversation or chat in Spanish:
- Switch fully to Spanish and respond conversationally in Spanish only.
- Stay in Spanish for follow-up messages unless they ask for an explanation or help understanding something.
- If they ask in English what something means or how to say something, briefly answer in English then return to Spanish.

Adapt to what the learner needs:
- If they write Spanish with mistakes, gently correct them and explain in English why. Provide depth based on the word type:
  - Verbs: mention the infinitive, its English meaning, the correct conjugation, the subject it refers to (yo, tú, él/ella, etc.), and whether the verb is regular or irregular.
  - Nouns: mention the gender (masculine/feminine), whether it's singular/plural, and any related article changes (el/la, un/una, los/las).
  - Adjectives: explain agreement with the noun (gender and number), and where it usually goes (before or after the noun).
  - Pronouns: explain which person/case it is (subject, object, reflexive, possessive) and what it replaces.
  - Prepositions: explain when to use it vs alternatives (por vs para, a vs en, etc.).
  - Articles, accents, punctuation, or spelling: explain the rule briefly.
  End with the fully corrected Spanish sentence.
- If they ask grammar questions, explain in English with Spanish examples.
- If they ask how to say something, explain in English and provide the Spanish translation.

Keep responses warm and conversational - like a tutor sitting next to them. Use 1-7 sentences depending on what's needed.

Format your responses so corrected or example Spanish sentences appear clearly, usually at the end.`;

// Validation schemas
const createConversationSchema = z.object({
    title: z.string().trim().max(100).optional(),
});

const sendMessageSchema = z.object({
    content: z.string().trim().min(1, "Message cannot be empty").max(2000),
});

// -------- Create Conversation --------
// Inserts a new empty conversation for the user. Title is optional.
// Returns the full new conversation row so the frontend can navigate to it immediately.
export const createConversation = async (req: Request, res: Response): Promise<Response> => {
    const parsed = createConversationSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const userId = req.user?.id;
    const { title } = parsed.data;

    try {
        // RETURNING * gives back the new row in one query instead of a separate SELECT
        const result = await db.query(
            `INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *`,
            [userId, title]
        );

        return res.status(201).json(result.rows[0]);

    } catch (err) {
        logger.error("[chatController.createConversation]", err);
        return res.status(500).json({ message: "Failed to create conversation" });
    }
};

// -------- Get All Conversations --------
// Lists all conversations for the logged-in user, sorted by most recent activity
// (updated_at, not created_at, so active chats bubble to the top of the sidebar).
export const getConversations = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    try {
        const result = await db.query(
            `SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC`,
            [userId]
        );

        // Returning result.rows (the array) - empty array is fine if user has no conversations
        return res.status(200).json(result.rows);

    } catch (err) {
        logger.error("[chatController.getConversations]", err);
        return res.status(500).json({ message: "Failed to fetch conversations" });
    }
};

// -------- Get All Messages In A Conversation --------
// Loads the message history of one conversation, oldest first.
// Uses a JOIN to enforce ownership - if the conversation doesn't belong to this user,
// the WHERE clause filters out all rows and we return [].
export const getAllMessages = async (req: Request, res: Response): Promise<Response> => {
    const conversationId = req.params.id;
    const userId = req.user?.id;

    try {
        const result = await db.query(
            `SELECT m.* 
             FROM messages m
             JOIN conversations c ON c.id = m.conversation_id
             WHERE c.id = $1 AND c.user_id = $2
             ORDER BY m.created_at ASC`,
            [conversationId, userId]
        );
        return res.status(200).json(result.rows);

    } catch (err) {
        logger.error("[chatController.getAllMessages]", err);
        return res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// -------- Send Message --------
// Saves the user's message, fetches conversation history, calls Gemini, saves the AI response,
// and updates the conversation timestamp.
// Uses two separate transactions with the Gemini call in between - this keeps DB connections
// from being held open during the slow external API call.
export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const conversationId = req.params.id;
    const userId = req.user?.id;
    const { content } = parsed.data;

    // Declared outside the try block so they're accessible after the transaction closes
    let history: { role: string; content: string }[];
    let aiResponse: string;

    // ===== Transaction 1: ownership check + save user message + fetch history =====
    const client: PoolClient = await db.connect();
    try {
        await client.query('BEGIN');

        // FOR UPDATE locks the conversation row so it can't be deleted mid-transaction
        const ownerCheck = await client.query(
            `SELECT id FROM conversations WHERE id = $1 AND user_id = $2 FOR UPDATE`,
            [conversationId, userId]
        );

        // 404 (not 403) to hide whether the conversation exists from unauthorized users
        if (ownerCheck.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Save the user's message
        await client.query(
            `INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
            [conversationId, 'user', content]
        );

        // Fetch full history (including the just-saved user message) to send to Gemini
        const historyResult = await client.query(
            `SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
            [conversationId]
        );

        history = historyResult.rows as { role: string; content: string }[];
        await client.query('COMMIT');

    } catch (err) {
        await client.query('ROLLBACK');
        logger.error("[chatController.sendMessage] tx1 failed", err);
        return res.status(500).json({ message: "Failed to send message" });
    } finally {
        // Always release the connection back to the pool, even on error
        client.release();
    }

    // ===== Gemini call (outside any transaction since it's a slow external API) =====
    // Separate try/catch - if AI fails, we don't roll back the user's message (they did send it)
    try {
        aiResponse = await generateChatResponse(
            history as { role: 'user' | 'assistant'; content: string }[],
            CHAT_SYSTEM_INSTRUCTION
        );
    } catch (err) {
        logger.error("[chatController.sendMessage] AI call failed", err);
        return res.status(500).json({ message: "Failed to generate response" });
    }

    // ===== Transaction 2: save AI response + bump conversation timestamp =====
    const client2: PoolClient = await db.connect();

    try {
        await client2.query('BEGIN');

        // Save the AI's response as an assistant message
        await client2.query(
            `INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
            [conversationId, 'assistant', aiResponse]
        );

        // Update updated_at so this conversation bubbles to the top of the sidebar
        await client2.query(
            `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
            [conversationId]
        );

        await client2.query('COMMIT');

        return res.status(201).json({
            message: "Conversation updated",
            aiResponse
        });

    } catch (err) {
        await client2.query('ROLLBACK');
        logger.error("[chatController.sendMessage] tx2 failed", err);
        return res.status(500).json({ message: "Failed to save AI response" });
    } finally {
        client2.release();
    }
};

// -------- Delete Conversation --------
// Removes a conversation and all its messages (messages cascade automatically via the FK).
// Uses a transaction to lock the row during ownership check + delete.
export const deleteConversation = async (req: Request, res: Response): Promise<Response> => {
    const conversationId = req.params.id;
    const userId = req.user?.id;

    const client: PoolClient = await db.connect();
    try {
        await client.query('BEGIN');

        // Ownership check with row lock
        const ownerResult = await client.query(
            `SELECT id FROM conversations WHERE id = $1 AND user_id = $2 FOR UPDATE`,
            [conversationId, userId]
        );

        if (ownerResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Delete the conversation - messages auto-delete via ON DELETE CASCADE
        await client.query(
            `DELETE FROM conversations WHERE id = $1`,
            [conversationId]
        );

        await client.query('COMMIT');

        return res.status(200).json({ message: "Conversation deleted" });

    } catch (err) {
        await client.query('ROLLBACK');
        logger.error("[chatController.deleteConversation]", err);
        return res.status(500).json({ message: "Could not delete conversation" });
    } finally {
        client.release();
    }
};