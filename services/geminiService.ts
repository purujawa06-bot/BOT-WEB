import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = "You are a helpful and friendly AI assistant named Robot AI. Format your responses using markdown. Use code blocks for code snippets, lists for bullet points, and bold/italics for emphasis.";

export async function* getGeminiStream(prompt: string, apiKey: string): AsyncIterable<{ text: string }> {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield { text: chunk.text };
            }
        }
    } catch (error) {
        console.error("Error with Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("Invalid Gemini API Key. Switching back to default AI.");
        }
        throw error;
    }
}
