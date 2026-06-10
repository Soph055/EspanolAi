import { GoogleGenAI } from '@google/genai';
import logger from './logger';

// Initialize the Gemini client with API key from env
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Generates a text response from Gemini
async function generateContent(prompt: string,
    systemInstruction: string | null = null): Promise<string> {
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
    } catch (err) {
        logger.error("[gemini.generateContent]", err);
        throw err;
    }
}

//generates text response with knowing chat history
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

async function generateChatResponse(
    messages: ChatMessage[],
    systemInstruction: string
): Promise<string> {
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
    } catch (err) {
        logger.error("[gemini.generateChatResponse]", err);
        throw err;
    }
}

export { generateContent, generateChatResponse };