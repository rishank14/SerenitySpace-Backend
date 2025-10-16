// services/gemini.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a compassionate, calm, and emotionally supportive AI companion in a mental health app called SerenitySpace. 
Your job is to listen, validate the feelings of the user, and respond with kindness, empathy, and encouragement.
You are not a therapist, and you do not offer medical advice.
Avoid judgment. Be warm, gentle, and human-like. Use simple, comforting language.
Encourage the user to reflect and express more if they are comfortable.`;

// Persistent chat session
let chatSession = null;

export async function getGeminiChatResponse(userMessage, reset = false) {
   if (reset) resetGeminiChat();

   try {
      if (!chatSession) {
         const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash",
            systemInstruction: SYSTEM_PROMPT,
         });

         chatSession = model.startChat({ history: [] });
      }

      const result = await chatSession.sendMessage(userMessage);
      return result.response.text();
   } catch (error) {
      console.error("Gemini Chat Error:", {
         message: error?.message,
         stack: error?.stack,
         cause: error?.cause,
      });
      throw new Error("Failed to get response from SerenityBot");
   }
}

export function resetGeminiChat() {
   chatSession = null;
}
