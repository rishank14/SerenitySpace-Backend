import MessageVault from "../models/MessageVault.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createMessageVault = asyncHandler(async (req, res) => {
   const { message, deliverAt } = req.body;

   if (!message || message.trim() === "") {
      throw new ApiError(400, "Message cannot be empty");
   }

   // Validate deliverAt
   if (!deliverAt || isNaN(new Date(deliverAt).getTime())) {
      throw new ApiError(400, "Invalid or missing delivery date");
   }

   // Check if deliverAt is in the future
   if (new Date(deliverAt) <= new Date()) {
      throw new ApiError(400, "Delivery date must be in the future");
   }

   const newMessage = await MessageVault.create({
      user: req?.user?._id,
      message: message.trim(),
      deliverAt: new Date(deliverAt),
   });

   return res
      .status(201)
      .json(
         new ApiResponse(201, newMessage, "Message saved to vault successfully")
      );
});

const updateMessageVault = asyncHandler(async (req, res) => {
   const { messageId } = req.params;
   const { message, deliverAt } = req.body;

   if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new ApiError(400, "Invalid message ID");
   }

   // Check if update fields are provided
   if (!message && !deliverAt) {
      throw new ApiError(400, "Please provide message or deliverAt to update");
   }

   const vaultMessage = await MessageVault.findOne({
      _id: messageId,
      user: req?.user?._id,
   });

   if (!vaultMessage) {
      throw new ApiError(404, "Message not found or you are not authorized");
   }

   if (vaultMessage.delivered) {
      throw new ApiError(
         403,
         "Cannot update a message that has already been delivered"
      );
   }

   // Apply updates
   if (message !== undefined) {
      if (message.trim() === "") {
         throw new ApiError(400, "Message cannot be empty");
      }
      vaultMessage.message = message.trim();
   }

   if (deliverAt !== undefined) {
      const newDeliverAt = new Date(deliverAt);
      if (isNaN(newDeliverAt)) {
         throw new ApiError(400, "Invalid deliverAt date");
      }
      if (newDeliverAt <= new Date()) {
         throw new ApiError(400, "Delivery date must be in the future");
      }
      vaultMessage.deliverAt = newDeliverAt;
   }

   await vaultMessage.save();

   return res
      .status(200)
      .json(new ApiResponse(200, vaultMessage, "Message updated successfully"));
});

const deleteMessageVault = asyncHandler(async (req, res) => {
   const { messageId } = req.params;

   if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new ApiError(400, "Invalid message ID");
   }

   const vaultMessage = await MessageVault.findOne({
      _id: messageId,
      user: req?.user?._id,
   });

   if (!vaultMessage) {
      throw new ApiError(404, "Message not found or you are not authorized");
   }

   const deletedMessage = await MessageVault.findByIdAndDelete(messageId);

   if (!deletedMessage) {
      throw new ApiError(500, "Failed to delete message");
   }

   return res
      .status(200)
      .json(
         new ApiResponse(200, deletedMessage, "Message deleted successfully")
      );
});

const getMessageVaultById = asyncHandler(async (req, res) => {
   const { messageId } = req.params;

   // Validate ObjectId
   if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new ApiError(400, "Invalid message ID");
   }

   // Find the message and ensure it belongs to the logged-in user
   const vaultMessage = await MessageVault.findOne({
      _id: messageId,
      user: req?.user?._id,
   });

   if (!vaultMessage) {
      throw new ApiError(404, "Message not found or not authorized");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, vaultMessage, "Message fetched successfully"));
});

const getDeliveredMessages = asyncHandler(async (req, res) => {
   const userId = req?.params?.userId;

   if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
   }

   if (String(req.user._id) !== String(userId)) {
      throw new ApiError(
         403,
         "You are not authorized to access these messages"
      );
   }

   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 15;
   const skip = (page - 1) * limit;

   const now = new Date();

   // Mark messages as delivered
   await MessageVault.updateMany(
      { user: userId, deliverAt: { $lte: now }, delivered: false },
      { $set: { delivered: true } }
   );

   const filter = { user: userId, deliverAt: { $lte: now } };

   const totalMessages = await MessageVault.countDocuments(filter);

   const messages = await MessageVault.find(filter)
      .sort({ deliverAt: -1 })
      .skip(skip)
      .limit(limit);

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            { messages, total: totalMessages, page, limit },
            "Delivered messages fetched successfully"
         )
      );
});

const getUpcomingMessages = asyncHandler(async (req, res) => {
   const userId = req?.params?.userId;

   if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
   }

   if (String(req.user._id) !== String(userId)) {
      throw new ApiError(
         403,
         "You are not authorized to access these messages"
      );
   }

   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 15;
   const skip = (page - 1) * limit;

   const now = new Date();
   const filter = { user: userId, deliverAt: { $gt: now } };

   const totalMessages = await MessageVault.countDocuments(filter);

   const messages = await MessageVault.find(filter)
      .sort({ deliverAt: 1 }) // upcoming ones sorted by soonest
      .skip(skip)
      .limit(limit);

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            { messages, total: totalMessages, page, limit },
            "Upcoming messages fetched successfully"
         )
      );
});

export {
   createMessageVault,
   updateMessageVault,
   deleteMessageVault,
   getMessageVaultById,
   getDeliveredMessages,
   getUpcomingMessages,
};
