// This service now uses puter.ai.chat()
declare const puter: any;

/**
 * Gets a streaming AI response from puter.ai.
 * @param prompt The user's prompt.
 * @returns An async iterable stream of response chunks.
 */
export async function getAiResponseStream(prompt: string): Promise<AsyncIterable<{ text: string }>> {
  try {
    const messages = [
        {
            role: 'system',
            content: "You are a helpful and friendly AI assistant named Robot AI. Format your responses using markdown. Use code blocks for code snippets, lists for bullet points, and bold/italics for emphasis."
        },
        {
            role: 'user',
            content: prompt
        }
    ];

    const responseStream = await puter.ai.chat(messages, { 
      model: 'claude-3-haiku-20240307', // A fast and capable model available on Puter
      stream: true,
    });
    return responseStream;
  } catch (error) {
    console.error("Error getting AI stream:", error);
    // Re-throw the error to be handled by the calling function
    throw error;
  }
}
