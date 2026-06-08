import { Request, Response} from 'express';
import db from '../db/db';
import logger from '../lib/logger';
import { generateContent} from '../lib/gemini'
import {z} from 'zod';


const createConversationSchema = z.object({
    title: z.string().trim().max(100).optional(),
});

export const createConversation = async (req: Request, res:Response): Promise<Response> => {
    const parsed = createConversationSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const userId = req.user?.id;
    const { title } = parsed.data;

    try {
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

export const getConversations = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    try {
        const result = await db.query(
            `SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC`,
            [userId]
        );

        return res.status(200).json(result.rows);

    } catch (err) {
        logger.error("[chatController.getConversations]", err);
        return res.status(500).json({ message: "Failed to fetch conversations" });
    }
};

export const getAllMessages = async (req: Request, res:Response): Promise<Response> => {
const conversationId = req.params.id;
const userId = req.user?.id;

try{
    const result = await db.query(
        `SELECT m.* 
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE c.id = $1 AND c.user_id = $2
         ORDER BY m.created_at ASC`,
        [conversationId, userId]
    );
    return res.status(200).json(result.rows);

} catch(err) {
    logger.error("[chatController.getAllMessages]", err);
    return res.status(500).json({message:"Failed to fetch messages"});

}

};