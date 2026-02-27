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

// Per-user chat sessions: userId -> { session, lastUsed }
const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

export async function getGeminiChatResponse(
   userId,
   userMessage,
   reset = false
) {
   if (reset) sessions.delete(userId);

   try {
      let entry = sessions.get(userId);

      if (!entry) {
         const model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
         });

         entry = {
            session: model.startChat({ history: [] }),
            lastUsed: Date.now(),
         };
         sessions.set(userId, entry);
      }

      entry.lastUsed = Date.now();
      const result = await entry.session.sendMessage(userMessage);
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

// Cleanup stale sessions every 10 minutes
setInterval(
   () => {
      const now = Date.now();
      for (const [id, entry] of sessions) {
         if (now - entry.lastUsed > SESSION_TTL) sessions.delete(id);
      }
   },
   10 * 60 * 1000
);
