import { getGeminiStream } from './geminiService';
import { getPuterStream } from './puterService';

export type AiProvider = 'puter' | 'gemini';

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
