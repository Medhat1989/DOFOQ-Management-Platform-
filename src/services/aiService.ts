import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const aiService = {
  async chat(message: string, context: any) {
    const model = "gemini-3-flash-preview";
    const systemInstruction = `
      You are a helpful work management assistant.
      You have access to the current board context: ${JSON.stringify(context)}.
      Help the user manage their tasks, summarize progress, or suggest project plans.
      Be concise, professional, and helpful.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: message,
        config: {
          systemInstruction,
        },
      });
      return response.text;
    } catch (error) {
      console.error('AI Chat failed', error);
      return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
  }
};
