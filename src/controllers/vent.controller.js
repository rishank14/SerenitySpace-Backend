import Vent from "../models/Vent.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createVent = asyncHandler(async (req, res) => {
   const { message, mood, visibility } = req.body;

   if (!message || message.trim() === "") {
      throw new ApiError(400, "Vent message cannot be empty");
   }

   const vent = await Vent.create({
      user: req.user._id,
      message,
      mood: mood || "neutral",
      visibility: visibility || "private",
   });

   await vent.populate("user", "username");

   return res
      .status(201)
      .json(new ApiResponse(201, vent, "Vent created successfully"));
});

const updateVent = asyncHandler(async (req, res) => {
   const { ventId } = req.params;
   const { message, mood, visibility } = req.body;

   // Validate ObjectId
   if (!mongoose.Types.ObjectId.isValid(ventId)) {
      throw new ApiError(400, "Invalid vent ID");
   }

   if ((!message || message.trim() === "") && !mood && !visibility) {
      throw new ApiError(
         400,
         "Please provide message, mood or visibility to update"
      );
   }

   const vent = await Vent.findOne({ _id: ventId, user: req.user?._id });

   if (!vent) {
      throw new ApiError(404, "Vent not found or you are not authorized");
   }

   if (message && message.trim() !== "") vent.message = message;
   if (mood) vent.mood = mood;
   if (visibility) vent.visibility = visibility;

   await vent.save();

   await vent.populate("user", "username");

   return res
      .status(200)
      .json(new ApiResponse(200, vent, "Vent updated successfully"));
});

const deleteVent = asyncHandler(async (req, res) => {
   const { ventId } = req.params;

   // Validate ObjectId
   if (!mongoose.Types.ObjectId.isValid(ventId)) {
      throw new ApiError(400, "Invalid vent ID");
   }

   const vent = await Vent.findById(ventId);
   if (!vent) {
      throw new ApiError(404, "Vent not found");
   }
   if (String(vent.user) !== String(req.user?._id)) {
      throw new ApiError(403, "You are not authorized to delete this vent");
   }

   const deletedVent = await Vent.findByIdAndDelete(ventId);

   if (!deletedVent) {
      throw new ApiError(500, "Vent could not be deleted");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, deletedVent, "Vent deleted successfully"));
});

const getVentById = asyncHandler(async (req, res) => {
   const { ventId } = req.params;

   // Validate ObjectId
   if (!mongoose.Types.ObjectId.isValid(ventId)) {
      throw new ApiError(400, "Invalid vent ID");
   }

   // Find the vent
   const vent = await Vent.findById(ventId).populate("user", "username");

   if (!vent) {
      throw new ApiError(404, "Vent not found");
   }

   // Check visibility
   if (
      vent.visibility === "private" &&
      String(vent.user._id) !== String(req.user?._id)
   ) {
      throw new ApiError(403, "You are not authorized to view this vent");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, vent, "Vent fetched successfully"));
});

const getAllVents = asyncHandler(async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 15;
   const skip = (page - 1) * limit;

   const { mood } = req.query;
   const filter = {};

   if (mood) filter.mood = mood;

   // Only fetch public vents or vents of the current user
   filter.$or = [{ visibility: "public" }, { user: req.user?._id }];

   const totalVents = await Vent.countDocuments(filter);

   const vents = await Vent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username");

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            { vents, total: totalVents, page, limit },
            "Vents fetched successfully"
         )
      );
});

const getUserVents = asyncHandler(async (req, res) => {
   const { userId } = req.params;

   if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
   }

   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 15;
   const skip = (page - 1) * limit;

   const { mood } = req.query;
   let filter = { user: userId };

   // If the requesting user is NOT the same as the target user, only show public vents
   if (String(req?.user._id) !== String(userId)) {
      filter.visibility = "public";
   }

   if (mood) filter.mood = mood;

   const totalVents = await Vent.countDocuments(filter);

   const vents = await Vent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username");

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            { vents, total: totalVents, page, limit },
            "User's vents fetched successfully"
         )
      );
});

export {
   createVent,
   updateVent,
   deleteVent,
   getVentById,
   getAllVents,
   getUserVents,
};
