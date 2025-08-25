import { Router } from "express";
import {
   createMessageVault,
   updateMessageVault,
   deleteMessageVault,
   getMessageVaultById,
   getDeliveredMessages,
   getUpcomingMessages,
} from "../controllers/messageVault.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Create a new message
router.post("/create", verifyJWT, createMessageVault);
// Update a message (only if not delivered)
router.patch("/update/:messageId", verifyJWT, updateMessageVault);
// Delete a message
router.delete("/delete/:messageId", verifyJWT, deleteMessageVault);

// Get all delivered messages for a user
router.get("/delivered/:userId", verifyJWT, getDeliveredMessages);
// Get all upcoming (undelivered) messages for a user
router.get("/upcoming/:userId", verifyJWT, getUpcomingMessages);
// Get a specific message (must belong to user)
router.get("/:messageId", verifyJWT, getMessageVaultById);

export default router;
