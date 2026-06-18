import { Request, Response } from "express";
import db from "../db/db";
import logger from "../lib/logger";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3, deleteFromS3 } from "../lib/s3";
import { extractText, getFileType } from "../lib/textExtractor";
import { Result } from "pg";


export const uploadDocument = async (req: Request, res: Response): Promise<Response> => {
    // Check if file passed multer middleware
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user?.id;
    const file = req.file;
    const fileType = getFileType(file.mimetype);

    if (fileType === null) {
        return res.status(400).json({ message: "Invalid file type" });
    }

    const fileBuffer = file.buffer;
    const fileSize = file.size;
    const s3Key = `users/${userId}/documents/${uuidv4()}.${fileType}`;

    // Extract text BEFORE uploading to S3 - cheaper to fail early
    let extractedText: string;
    try {
        extractedText = await extractText(fileBuffer, fileType);
    } catch (err) {
        logger.error("[documentsController.uploadDocument] text extraction failed", err);
        return res.status(500).json({ message: "Could not read file" });
    }

    if (extractedText.length < 10) {
        return res.status(400).json({ message: "Document has no readable text" });
    }

    // Upload original file to S3
    try {
        await uploadToS3(s3Key, fileBuffer, file.mimetype);
    } catch (err) {
        logger.error("[documentsController.uploadDocument] S3 upload failed", err);
        return res.status(500).json({ message: "Failed to upload file" });
    }

    // Save metadata + extracted text to DB
    try {
        const result = await db.query(
            `INSERT INTO documents (user_id, filename, s3_key, extracted_text, file_type, file_size) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, file.originalname, s3Key, extractedText, fileType, fileSize]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        // Compensating action - clean up the S3 file since DB insert failed
        await deleteFromS3(s3Key).catch(e => logger.error("[uploadDocument cleanup]", e));
        logger.error("[documentsController.uploadDocument] DB insert failed", err);
        return res.status(500).json({ message: "Failed to save document" });
    }
};

export const getAllDocuments = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    try {
        const result = await db.query(
            `SELECT id, user_id, filename, file_type, file_size, created_at 
             FROM documents 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json(result.rows);

    } catch (err) {
        logger.error("[documentsController.getAllDocuments]", err);
        return res.status(500).json({ message: "Failed to fetch documents" });
    }
};

export const getDocument = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const id = req.params.id;

    try {
        const result = await db.query(
            `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Document not found" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (err) {
        logger.error("[documentsController.getDocument]", err);
        return res.status(500).json({ message: "Failed to fetch document" });
    }
};
export const deleteDocument = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const id = req.params.id;

    try {
        // Find the document and verify ownership in one query
        const result = await db.query(
            `SELECT s3_key FROM documents WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Document not found" });
        }

        const s3Key = result.rows[0].s3_key;

        // Delete from S3 first - if this fails, DB row stays so user can retry
        await deleteFromS3(s3Key);

        // Delete the DB row (ownership re-checked in WHERE as defense-in-depth)
        await db.query(
            `DELETE FROM documents WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        return res.status(200).json({ message: "Document deleted" });

    } catch (err) {
        logger.error("[documentsController.deleteDocument]", err);
        return res.status(500).json({ message: "Failed to delete document" });
    }
};