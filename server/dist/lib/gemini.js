"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = generateContent;
exports.generateChatResponse = generateChatResponse;
const genai_1 = require("@google/genai");
const logger_1 = __importDefault(require("./logger"));
// Initialize the Gemini client with API key from env
const genAI = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Generates a text response from Gemini
async function generateContent(prompt, systemInstruction = null) {
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            // Conditionally include system instruction if provided
            ...(systemInstruction && {
                config: { systemInstruction }
            }),
        });
        if (!response.text) {
            throw new Error("Gemini returned empty response");
        }
        return response.text;
    }
    catch (err) {
        logger_1.default.error("[gemini.generateContent]", err);
        throw err;
    }
}
async function generateChatResponse(messages, systemInstruction) {
    try {
        // Gemini uses 'model' instead of 'assistant' for AI messages
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: { systemInstruction }
        });
        if (!response.text) {
            throw new Error("Gemini returned empty response");
        }
        return response.text;
    }
    catch (err) {
        logger_1.default.error("[gemini.generateChatResponse]", err);
        throw err;
    }
}
//# sourceMappingURL=gemini.js.map