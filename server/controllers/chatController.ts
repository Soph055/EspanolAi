import { Request, Response} from 'express';
import db from '../db/db';
import logger from '../lib/logger';
import { generateContent} from '../lib/gemini'
import {z} from 'zod';


const CHAT_SYSTEM_INSTRUCTION = `You are a friendly, encouraging Spanish language tutor having a natural conversation with an English-speaking learner. 

Adapt to what the learner needs:
- If they write Spanish with mistakes, gently correct them and explain why. For verb mistakes, mention the infinitive, its English meaning, the correct conjugation, and whether the verb is regular or irregular.
- If they ask grammar questions, explain clearly with examples.
- If they want to chat, have a natural conversation in Spanish (and offer English help when useful).
- If they ask how to say something, explain it clearly.

Keep responses warm and conversational - like a tutor sitting next to them. Use 1-7 sentences depending on what's needed.

You can write in both Spanish and English freely - whatever helps the learner most.`;

const createConversationSchema = z.object({
    title: z.string().trim().max(100).optional(),
});

const sendMessageSchema = z.object({
    content: z.string().trim().min(1, "Message cannot be empty").max(2000),
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

export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
const parsed = sendMessageSchema.safeParse(req.body);
if(!parsed.success){
    return res.status(400).json({ message: parsed.error.issues[0].message});
}
const conversationId = req.params.id;
const userId = req.user?.id;
const { content } = parsed.data;


try {
    const ownerChceck = await db.query(

   "SELECT id FROM conversations WHERE user_id = $1 AND id = $2" ,
   [userId, conversationId]
    );

    if(ownerChceck.rowCount === 0){
        return res.status(404).json({ message: "Conversation not found" });
    }

    await db.query(`INSERT INTO messages (conversation_id, role, content) VALUES($1, $2, $3)`),
    [conversationId, 'user', content];

   

   
return res.status(200);
} catch (err) {
    logger.error("[chatController.sendMessage]", err);
    return res.status(500).json({ message: "Failed to send message" });
}
};