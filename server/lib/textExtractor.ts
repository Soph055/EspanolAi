import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";
import logger from "./logger";

export const extractText = async (buffer: Buffer, fileType: string): Promise<string> => {
    try {
        if (fileType === 'pdf') {
            const data = await (pdfParse as any).default(buffer);
            return data.text;
        }

        if (fileType === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }

        if (fileType === 'txt') {
            return buffer.toString('utf-8');
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