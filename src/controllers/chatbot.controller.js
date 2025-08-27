import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getGeminiChatResponse } from "../services/gemini.service.js";

export const handleChatbotMessage = asyncHandler(async (req, res) => {
   const { message } = req.body;

   if (!message || message.trim() === "") {
      throw new ApiError(400, "Message cannot be empty");
   }

   const reply = await getGeminiChatResponse(message.trim());

   return res
      .status(200)
      .json(
         new ApiResponse(200, { reply }, "Chatbot reply fetched successfully")
      );
});
