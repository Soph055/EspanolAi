const { GoogleGenAI } = require("@google/genai");
const logger = require("./logger");

// Initialize the Gemini client with API key from env
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

        return response.text;
    } catch (err) {
        logger.error("[gemini.generateContent]", err);
        throw err;
    }
}

module.exports = { generateContent };