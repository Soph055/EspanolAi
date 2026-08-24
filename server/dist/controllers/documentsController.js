"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestions = exports.deleteDocument = exports.getDocument = exports.getAllDocuments = exports.uploadDocument = void 0;
const db_1 = __importDefault(require("../db/db"));
const logger_1 = __importDefault(require("../lib/logger"));
const uuid_1 = require("uuid");
const s3_1 = require("../lib/s3");
const textExtractor_1 = require("../lib/textExtractor");
const zod_1 = require("zod");
const gemini_1 = require("../lib/gemini");
// Cap text sent to Gemini to stay within context limits and control AI costs
const MAX_TEXT_LENGTH = 30000;
// Validation schema for question generation - questionCount defaults to 5 if missing
const questionsSchema = zod_1.z.object({
    questionCount: zod_1.z.number().int().min(3).max(15).default(5),
});
// System prompt for Gemini - defines question format and required JSON output
const QUESTIONS_SYSTEM_INSTRUCTION = `You are a Spanish reading comprehension question generator. Given a Spanish text passage, generate multiple-choice comprehension questions to help an English-speaking learner test their understanding.

For each question:
- Write the question in English (so the learner can understand what's being asked)
- Provide 4 answer options that are short Spanish phrases or words from the passage
- Mark which option is correct
- Focus on comprehension - main ideas, key facts, vocabulary in context, character/setting details

The questions should range in difficulty - some about explicit facts, others requiring inference.

Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "question": "<question text in English>",
      "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
      "correctAnswer": "<the correct option>"
    }
  ]
}

The correctAnswer must appear exactly once in the options array. Do not include markdown formatting, code blocks, or any text outside the JSON object.`;
// -------- Upload Document --------
// Handles file upload via multer middleware. The flow is:
// 1. Validate file type and presence (multer rejects most bad cases before this runs)
// 2. Extract text from the file BEFORE uploading to S3 (cheaper to fail early)
// 3. Upload original file to S3 for archival
// 4. Save metadata + extracted text to DB
// If DB insert fails after S3 upload succeeded, the S3 file is cleaned up (compensating action).
const uploadDocument = async (req, res) => {
    // Multer attaches the uploaded file to req.file - this check covers edge cases where it didn't
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const userId = req.user?.id;
    const file = req.file;
    // Convert AWS-style MIME type to our short internal name (pdf/docx/txt)
    const fileType = (0, textExtractor_1.getFileType)(file.mimetype);
    if (fileType === null) {
        return res.status(400).json({ message: "Invalid file type" });
    }
    const fileBuffer = file.buffer;
    const fileSize = file.size;
    // S3 key uses a UUID so file URLs aren't guessable.
    // Organizing by user_id keeps files logically separated.
    const s3Key = `users/${userId}/documents/${(0, uuid_1.v4)()}.${fileType}`;
    // Extract text BEFORE uploading to S3 - fails fast on bad/corrupted files
    // without wasting bandwidth on an S3 upload that would just be deleted
    let extractedText;
    try {
        extractedText = await (0, textExtractor_1.extractText)(fileBuffer, fileType);
    }
    catch (err) {
        logger_1.default.error("[documentsController.uploadDocument] text extraction failed", err);
        return res.status(500).json({ message: "Could not read file" });
    }
    // Reject empty/image-only files (e.g., scanned PDFs with no actual text)
    if (extractedText.length < 10) {
        return res.status(400).json({ message: "Document has no readable text" });
    }
    // Upload the original file to S3 for archival
    try {
        await (0, s3_1.uploadToS3)(s3Key, fileBuffer, file.mimetype);
    }
    catch (err) {
        logger_1.default.error("[documentsController.uploadDocument] S3 upload failed", err);
        return res.status(500).json({ message: "Failed to upload file" });
    }
    // Save metadata + extracted text to DB
    try {
        const result = await db_1.default.query(`INSERT INTO documents (user_id, filename, s3_key, extracted_text, file_type, file_size) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [userId, file.originalname, s3Key, extractedText, fileType, fileSize]);
        return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        // Compensating action - DB failed, so clean up the orphan S3 file we already uploaded.
        // The .catch on deleteFromS3 prevents a cleanup error from masking the original error.
        await (0, s3_1.deleteFromS3)(s3Key).catch(e => logger_1.default.error("[uploadDocument cleanup]", e));
        logger_1.default.error("[documentsController.uploadDocument] DB insert failed", err);
        return res.status(500).json({ message: "Failed to save document" });
    }
};
exports.uploadDocument = uploadDocument;
// -------- Get All Documents (list view) --------
// Returns metadata for all of the user's documents, newest first.
// Excludes extracted_text to keep the payload small - that's only needed in the detail view.
const getAllDocuments = async (req, res) => {
    const userId = req.user?.id;
    try {
        // Explicit column list - leaves out extracted_text and s3_key
        // (extracted_text would bloat the response; s3_key shouldn't leak to the client)
        const result = await db_1.default.query(`SELECT id, user_id, filename, file_type, file_size, created_at 
             FROM documents 
             WHERE user_id = $1 
             ORDER BY created_at DESC`, [userId]);
        return res.status(200).json(result.rows);
    }
    catch (err) {
        logger_1.default.error("[documentsController.getAllDocuments]", err);
        return res.status(500).json({ message: "Failed to fetch documents" });
    }
};
exports.getAllDocuments = getAllDocuments;
// -------- Get One Document (detail view) --------
// Returns a single document including its full extracted text.
// Ownership is enforced through the WHERE clause - non-owned docs return 404.
const getDocument = async (req, res) => {
    const userId = req.user?.id;
    const id = req.params.id;
    try {
        const result = await db_1.default.query(`SELECT * FROM documents WHERE id = $1 AND user_id = $2`, [id, userId]);
        // 404 (not 403) hides whether the document exists from unauthorized users
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Document not found" });
        }
        return res.status(200).json(result.rows[0]);
    }
    catch (err) {
        logger_1.default.error("[documentsController.getDocument]", err);
        return res.status(500).json({ message: "Failed to fetch document" });
    }
};
exports.getDocument = getDocument;
// -------- Delete Document --------
// Removes a document from both S3 and the DB.
// S3 is deleted first - if it fails, DB row stays so the user can retry.
// No transaction here because Postgres transactions don't span S3.
const deleteDocument = async (req, res) => {
    const userId = req.user?.id;
    const id = req.params.id;
    try {
        // Look up the s3_key while verifying ownership in one query
        const result = await db_1.default.query(`SELECT s3_key FROM documents WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Document not found" });
        }
        const s3Key = result.rows[0].s3_key;
        // Delete from S3 first - if this fails, the DB row stays so the user can retry
        await (0, s3_1.deleteFromS3)(s3Key);
        // Delete the DB row. user_id re-checked in WHERE as defense-in-depth.
        await db_1.default.query(`DELETE FROM documents WHERE id = $1 AND user_id = $2`, [id, userId]);
        return res.status(200).json({ message: "Document deleted" });
    }
    catch (err) {
        logger_1.default.error("[documentsController.deleteDocument]", err);
        return res.status(500).json({ message: "Failed to delete document" });
    }
};
exports.deleteDocument = deleteDocument;
// -------- Generate Comprehension Questions --------
// Uses Gemini to generate multiple-choice questions from the document's extracted text.
// Questions are NOT saved to the DB - users can regenerate fresh questions each call.
// Long documents are truncated to MAX_TEXT_LENGTH characters to stay within Gemini's context limit.
const generateQuestions = async (req, res) => {
    // Validate the optional questionCount - defaults to 5 if missing
    const parsed = questionsSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { questionCount } = parsed.data;
    const userId = req.user?.id;
    const id = req.params.id;
    try {
        // Fetch only the extracted_text since that's all we need for question generation.
        // Ownership enforced in WHERE clause.
        const result = await db_1.default.query(`SELECT extracted_text FROM documents WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Document not found" });
        }
        const extractedText = result.rows[0].extracted_text;
        // Truncate long documents to stay within Gemini's context limit and control cost
        const textForAI = extractedText.length > MAX_TEXT_LENGTH
            ? extractedText.slice(0, MAX_TEXT_LENGTH)
            : extractedText;
        // Build the prompt - the system instruction handles the rules,
        // this just provides the data and the requested question count
        const prompt = `Generate ${questionCount} comprehension questions for this Spanish text:\n\n${textForAI}`;
        // Call Gemini with our structured-output system instruction
        const aiResponse = await (0, gemini_1.generateContent)(prompt, QUESTIONS_SYSTEM_INSTRUCTION);
        // Parse the JSON - inner try/catch because LLMs occasionally return malformed JSON
        // or wrap the JSON in markdown code blocks despite being told not to
        let questions;
        try {
            questions = JSON.parse(aiResponse);
        }
        catch (err) {
            logger_1.default.error("[documentsController.generateQuestions] failed to parse AI response", { aiResponse, err });
            return res.status(500).json({ message: "AI returned invalid response format" });
        }
        // Sanity-check the shape - Gemini should have returned { questions: [...] }
        if (!questions.questions || !Array.isArray(questions.questions)) {
            logger_1.default.error("[documentsController.generateQuestions] AI response missing questions array", { questions });
            return res.status(500).json({ message: "AI returned invalid response format" });
        }
        return res.status(200).json(questions);
    }
    catch (err) {
        logger_1.default.error("[documentsController.generateQuestions]", err);
        return res.status(500).json({ message: "Failed to generate questions" });
    }
};
exports.generateQuestions = generateQuestions;
//# sourceMappingURL=documentsController.js.map