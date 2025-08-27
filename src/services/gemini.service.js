import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a compassionate, calm, and emotionally supportive AI companion in a mental health app called SerenitySpace. 
Your job is to listen, validate the feelings of the user, and respond with kindness, empathy, and encouragement.
You are not a therapist, and you do not offer medical advice.
Avoid judgment. Be warm, gentle, and human-like. Use simple, comforting language.
Encourage the user to reflect and express more if they are comfortable.`;

export async function getGeminiChatResponse(userMessage) {
   try {
      const model = genAI.getGenerativeModel({
         model: "models/gemini-1.5-flash-002",
         systemInstruction: SYSTEM_PROMPT,
      });

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      return text;
   } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Failed to get response from SerenityBot");
   }
}
