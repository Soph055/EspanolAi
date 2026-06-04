const db = require("../db/db");
const { z } = require("zod");
const logger = require("../lib/logger");
const { generateContent } = require("../lib/gemini");
const SYSTEM_INSTRUCTION = `You are a friendly Spanish language tutor for English-speaking learners. Your tone should be encouraging, warm, and conversational - like a tutor sitting next to the student.

Analyze the user's Spanish sentence (or sentences) and respond ONLY with valid JSON in this exact format:
{
  "corrected": "the corrected Spanish sentence(s), or the original if already correct",
  "translation": "the English translation of the corrected sentence(s)",
  "feedback": "a friendly, conversational message to the learner",
  "wasCorrect": true or false
}

Guidelines for the "feedback" field:
- If there were mistakes: open with something warm like "You were close but not quite!" or "Almost there!" Then explain what was wrong in a teaching way.
- For verb mistakes, always include:
  - The infinitive form of the verb and its English meaning (e.g., "the verb 'ir' means 'to go'")
  - The correct conjugation and who it's for (e.g., "'voy' is the first person singular conjugation, used for 'I'")
  - Whether the verb is regular or irregular, and if irregular, briefly note why (e.g., "'ir' is one of Spanish's most irregular verbs - its conjugations don't follow the normal -ir pattern")
- For other types of mistakes (gender agreement, ser vs estar, prepositions, accents, etc.), explain the rule and give a quick mnemonic or pattern when possible.
- If the sentence was already correct: open with something encouraging like "Great job!" or "Perfect!" and briefly note what was done well (good verb conjugation, correct gender agreement, etc.).
- - Keep feedback between 1 and 7 sentences. Use as much or as little as needed - a quick correction doesn't need a full lecture, but a complex mistake might.

Do not include markdown formatting, code blocks, or any text outside the JSON object.`;

const inputSchema = z.object({
    input: z.string().trim().min(1).max(500),
});

exports.correctSentence = async (req, res) => {
    const userId = req.user.id;

    const result = inputSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    const { input } = result.data;

    try {
        const aiResponse = await generateContent(input, SYSTEM_INSTRUCTION);

        let parsed;
        try {
            parsed = JSON.parse(aiResponse);
        } catch (err) {
            logger.error("[correctionsController.correctSentence] failed to parse AI response", { aiResponse, err });
            return res.status(500).json({ message: "AI returned invalid response" });
        }

        // Defensive defaults
        const corrected = parsed.corrected || input;
        const translation = parsed.translation || null;
        const feedback = parsed.feedback || null;
        const wasCorrect = parsed.wasCorrect === true;

        await db.query(
            `INSERT INTO corrections (user_id, original_sentence, corrected_sentence, translation, feedback, was_correct)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, input, corrected, translation, feedback, wasCorrect]
        );

        return res.status(200).json({ corrected, translation, feedback, wasCorrect });

    } catch (err) {
        logger.error("[correctionsController.correctSentence]", err);
        return res.status(500).json({ message: "Failed to process correction" });
    }
};