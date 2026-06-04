const db = require("../db/db");
const logger = require("../lib/logger");
const { generateContent } = require("../lib/gemini");
const { z } = require("zod");

const createConversationSchema = z.object({
    title: z.string().trim().max(100).optional(),
});

exports.createConversation = async (req, res) => {
    const parsed = createConversationSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const userId = req.user.id;
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