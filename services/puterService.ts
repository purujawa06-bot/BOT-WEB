declare const puter: any;

const SYSTEM_INSTRUCTION = "You are a helpful and friendly AI assistant named Robot AI. Format your responses using markdown. Use code blocks for code snippets, lists for bullet points, and bold/italics for emphasis.";

export async function getPuterStream(prompt: string): Promise<AsyncIterable<{ text: string }>> {
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

    try {
        const responseStream = await puter.ai.chat(messages, { 
          model: 'claude-3-haiku-20240307', 
          stream: true,
        });
        return responseStream;
    } catch (error) {
        console.error("Error getting Puter AI stream:", error);
        throw error;
    }
}
