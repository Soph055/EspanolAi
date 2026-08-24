"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileType = exports.extractText = void 0;
const pdf_parse_1 = require("pdf-parse");
const mammoth_1 = __importDefault(require("mammoth"));
const logger_1 = __importDefault(require("./logger"));
const extractText = async (buffer, fileType) => {
    try {
        if (fileType === "pdf") {
            const parser = new pdf_parse_1.PDFParse({ data: buffer });
            try {
                const result = await parser.getText();
                return result.text.trim();
            }
            finally {
                await parser.destroy();
            }
        }
        if (fileType === "docx") {
            const result = await mammoth_1.default.extractRawText({ buffer });
            return result.value.trim();
        }
        if (fileType === "txt") {
            return buffer.toString("utf-8").trim();
        }
        throw new Error(`Unsupported file type: ${fileType}`);
    }
    catch (err) {
        logger_1.default.error("[textExtractor.extractText]", err);
        throw err;
    }
};
exports.extractText = extractText;
const getFileType = (mimeType) => {
    if (mimeType === 'application/pdf')
        return 'pdf';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        return 'docx';
    if (mimeType === 'text/plain')
        return 'txt';
    return null;
};
exports.getFileType = getFileType;
//# sourceMappingURL=textExtractor.js.map