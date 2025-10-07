import { GoogleGenAI } from "@google/genai";
declare const puter: any;

export type AiProvider = 'puter' | 'gemini';

const SYSTEM_INSTRUCTION = "You are a helpful and friendly AI assistant named Robot AI. Format your responses using markdown. Use code blocks for code snippets, lists for bullet points, and bold/italics for emphasis.";

async function* getGeminiStream(prompt: string, apiKey: string): AsyncIterable<{ text: string }> {
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

async function getPuterStream(prompt: string): Promise<AsyncIterable<{ text: string }>> {
    const messages = [
        {
            role: 'system',
            content: SYSTEM_INSTRUCTION
        },
        {
            role: 'user',
            content: prompt
        }
    ];

    return puter.ai.chat(messages, { 
      model: 'claude-3-haiku-20240307', 
      stream: true,
    });
}

export function getAiResponseStream(prompt: string, provider: AiProvider, apiKey?: string): Promise<AsyncIterable<{ text: string }>> {
    if (provider === 'gemini') {
        if (!apiKey) {
            return Promise.reject(new Error("Gemini API Key is required."));
        }
        return Promise.resolve(getGeminiStream(prompt, apiKey));
    } else { // puter
        return getPuterStream(prompt);
    }
}
