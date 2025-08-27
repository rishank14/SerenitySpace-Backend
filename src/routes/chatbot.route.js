import { Router } from "express";
import { handleChatbotMessage } from "../controllers/chatbot.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/chat", verifyJWT, handleChatbotMessage);

export default router;
