import express from "express";
import * as documentsController from "../controllers/documentsController";
import requireAuth from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

// Upload a new document (file parsing handled by multer middleware)
router.post("/", requireAuth, upload.single("file"), documentsController.uploadDocument);

// List all documents for the user (metadata only, no full text)
router.get("/", requireAuth, documentsController.getAllDocuments);

// Get one document with its full extracted text
router.get("/:id", requireAuth, documentsController.getDocument);

// Delete a document (removes from both DB and S3)
router.delete("/:id", requireAuth, documentsController.deleteDocument);

export default router;