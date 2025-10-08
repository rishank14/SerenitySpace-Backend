import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a compassionate, calm, and emotionally supportive AI companion in a mental health app called SerenitySpace. 
Your job is to listen, validate the feelings of the user, and respond with kindness, empathy, and encouragement.
You are not a therapist, and you do not offer medical advice.
Avoid judgment. Be warm, gentle, and human-like. Use simple, comforting language.
Encourage the user to reflect and express more if they are comfortable.`;

export async function getGeminiChatResponse(userMessage, history = []) {
   try {
      const model = genAI.getGenerativeModel({
         model: "models/gemini-2.0-flash",
         systemInstruction: SYSTEM_PROMPT,
      });

      // Format conversation history
      const formattedHistory = history.map((msg) => ({
         role: msg.sender === "user" ? "user" : "model",
         parts: [{ text: msg.text || "" }],
      }));

      // Start a chat session with the history
      const chat = model.startChat({ history: formattedHistory });

      // Send the latest user message
      const result = await chat.sendMessage(userMessage);

      // Return the AI's text response
      return result.response.text();
   } catch (error) {
      console.error("Gemini Error:", {
         message: error?.message,
         stack: error?.stack,
         cause: error?.cause,
      });
      throw new Error("Failed to get response from SerenityBot");
   }
}
