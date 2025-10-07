import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Assume process.env.API_KEY is available in the execution environment as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getAiResponse(prompt: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful AI assistant. Format your responses using markdown. Use code blocks for code snippets, lists for bullet points, and bold/italics for emphasis."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error getting AI response:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return `Maaf, terjadi kesalahan saat menghubungi AI: ${errorMessage}. Silakan coba lagi.`;
  }
}
