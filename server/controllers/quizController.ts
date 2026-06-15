import db from "../db/db";
import { Request, Response } from "express";
import { generateContent } from "../lib/gemini";
import logger from "../lib/logger";
import { z } from "zod";
import { PoolClient } from "pg";

// System prompt for Gemini - defines quiz generation rules and required JSON output format
const QUIZ_SYSTEM_INSTRUCTION = `You are a Spanish quiz generator. Given a list of Spanish words with their English translations and IDs, generate multiple-choice questions.

For each word, create a question with:
- The Spanish word as the prompt
- 4 English answer options (1 correct, 3 plausible distractors from related vocabulary)
- The correct answer

Distractors should be related to the correct answer (similar meaning, same category, commonly confused). Avoid silly or unrelated options.

Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "vocabularyId": <id from input>,
      "word": "<spanish>",
      "options": ["<english1>", "<english2>", "<english3>", "<english4>"],
      "correctAnswer": "<correct english>"
    }
  ]
}

The order of options should be random. The correctAnswer must appear exactly once in the options array. Do not include markdown formatting, code blocks, or any text outside the JSON object.`;

// Validation schema for quiz generation request
// questionCount is optional, defaults to 10 if not provided
const quizSchema = z.object({
    questionCount: z.number().int().min(5).max(20).default(10),
});

const submitQuizSchema = z.object({
    answers: z.array(z.object({
        vocabularyId: z.number().int().positive(),
        userAnswer: z.string().trim().min(1),
        correctAnswer: z.string().trim().min(1)
    })).min(1, "At least 1 answer required").max(20),
});

// -------- Create Quiz --------
// Generates a multiple-choice quiz from the user's weakest vocabulary words.
// Words with more incorrect answers than correct ones are prioritized.
// Read-only on the DB side, so no transaction needed.
export const createQuiz = async (req: Request, res: Response): Promise<Response> => {
    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { questionCount } = parsed.data;
    const userId = req.user?.id;

    try {
        // Pull the user's weakest words first - sorted by net "wrongness"
        // RANDOM() as a tiebreaker prevents the exact same words appearing every quiz
        const result = await db.query(
            `SELECT id, word, translation FROM vocabulary 
             WHERE user_id = $1
             ORDER BY (times_incorrect - times_correct) DESC, RANDOM()
             LIMIT $2`,
            [userId, questionCount]
        );

        // Need at least 5 words to make a reasonable quiz
        if (result.rows.length < 5) {
            return res.status(400).json({ message: "Add at least 5 vocabulary words before taking a quiz" });
        }

        // Format the words into a clean text list for Gemini to read
        // Each word on its own line with its id, Spanish word, and English translation
        const wordList = result.rows
            .map(v => `id: ${v.id}, word: ${v.word}, translation: ${v.translation}`)
            .join('\n');
        const prompt = `Generate a multiple-choice quiz from these Spanish words:\n\n${wordList}`;

        // Send to Gemini - prompt is the data, system instruction is the rules
        const aiResponse = await generateContent(prompt, QUIZ_SYSTEM_INSTRUCTION);

        // Parse the JSON Gemini returned - this can fail if Gemini misbehaves and returns
        // text with markdown wrappers or malformed JSON
        let quiz;
        try {
            quiz = JSON.parse(aiResponse);
        } catch (err) {
            logger.error("[quizController.createQuiz] failed to parse AI response", { aiResponse, err });
            return res.status(500).json({ message: "AI returned invalid quiz format" });
        }

        // Sanity-check the shape - Gemini should have returned a questions array.
        // If not, the frontend would get garbage so we 500 instead.
        if (!quiz.questions || !Array.isArray(quiz.questions)) {
            logger.error("[quizController.createQuiz] AI response missing questions array", { quiz });
            return res.status(500).json({ message: "AI returned invalid quiz format" });
        }

        return res.status(200).json(quiz);
    } catch (err) {
        logger.error("[quizController.createQuiz]", err);
        return res.status(500).json({ message: "Failed to generate quiz" });
    }
};
export const submitQuiz = async (req: Request, res: Response): Promise<Response> => {
    const parsed = submitQuizSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const userId = req.user?.id;
    const { answers } = parsed.data;
    const client: PoolClient = await db.connect();
    let correctCount = 0;
    let incorrectCount = 0;

    try {
        await client.query("BEGIN");

        for (const answer of answers) {
            const isCorrect = answer.userAnswer.toLowerCase() === answer.correctAnswer.toLowerCase();
            const columnToInc = isCorrect ? 'times_correct' : 'times_incorrect';

            await client.query(
                `UPDATE vocabulary SET ${columnToInc} = ${columnToInc} + 1 WHERE id = $1 AND user_id = $2`,
                [answer.vocabularyId, userId]
            );

            if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        }

        await client.query("COMMIT");

        return res.status(200).json({
            totalQuestions: answers.length,
            correctCount,
            incorrectCount,
            score: `${Math.round((correctCount / answers.length) * 100)}%`
        });

    } catch (err) {
        await client.query("ROLLBACK");
        logger.error("[quizController.submitQuiz]", err);
        return res.status(500).json({ message: "Failed to update results" });
    } finally {
        client.release();
    }
};