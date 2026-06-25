import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import logger from "./logger";


export type SupportedFileType = "pdf" | "docx" | "txt";

export const extractText = async (
    buffer: Buffer,
    fileType: string
): Promise<string> => {
    try {
        if (fileType === "pdf") {
            const parser = new PDFParse({ data: buffer });

            try {
                const result = await parser.getText();
                return result.text.trim();
            } finally {
                await parser.destroy();
            }
        }

        if (fileType === "docx") {
            const result = await mammoth.extractRawText({ buffer });
            return result.value.trim();
        }

        if (fileType === "txt") {
            return buffer.toString("utf-8").trim();
        }

        throw new Error(`Unsupported file type: ${fileType}`);
    } catch (err) {
        logger.error("[textExtractor.extractText]", err);
        throw err;
    }
};



export const getFileType = (mimeType: string): 'pdf' | 'docx' | 'txt' | null => {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (mimeType === 'text/plain') return 'txt';
    return null;
};



