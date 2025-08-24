import Reflection from "../models/Reflection.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createReflection = asyncHandler(async (req, res) => {
   const { title, content, emotion, tags } = req.body;

   if (!content || content.trim() === "") {
      throw new ApiError(400, "Reflection content cannot be empty");
   }

   const reflection = await Reflection.create({
      user: req?.user?._id,
      title: title?.trim() || "Untitled",
      content,
      emotion: emotion || "neutral",
      tags: Array.isArray(tags)
         ? tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)
         : [],
   });

   return res
      .status(201)
      .json(
         new ApiResponse(201, reflection, "Reflection created successfully")
      );
});

const updateReflection = asyncHandler(async (req, res) => {
   const { reflectionId } = req.params;
   const { title, content, emotion, tags } = req.body;

   // Validate ID
   if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      throw new ApiError(400, "Invalid reflection ID");
   }

   // Validate at least one field is being updated
   if (!title && !content && !emotion && !tags) {
      throw new ApiError(400, "Please provide at least one field to update");
   }

   const reflection = await Reflection.findOne({
      _id: reflectionId,
      user: req?.user?._id,
   });

   if (!reflection) {
      throw new ApiError(404, "Reflection not found or not authorized");
   }

   if (title !== undefined) reflection.title = title.trim() || "Untitled";
   if (content !== undefined) {
      if (content.trim() === "") {
         throw new ApiError(400, "Content cannot be empty");
      }
      reflection.content = content;
   }
   if (emotion !== undefined) reflection.emotion = emotion;
   if (tags !== undefined) {
      reflection.tags = Array.isArray(tags)
         ? tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)
         : [];
   }

   await reflection.save();

   return res
      .status(200)
      .json(
         new ApiResponse(200, reflection, "Reflection updated successfully")
      );
});

const deleteReflection = asyncHandler(async (req, res) => {
   const { reflectionId } = req.params;

   // Validate ID
   if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      throw new ApiError(400, "Invalid reflection ID");
   }

   // Find the reflection
   const reflection = await Reflection.findById(reflectionId);

   if (!reflection) {
      throw new ApiError(404, "Reflection not found");
   }

   // Check ownership
   if (String(reflection.user) !== String(req?.user?._id)) {
      throw new ApiError(
         403,
         "You are not authorized to delete this reflection"
      );
   }

   const deletedReflection = await Reflection.findByIdAndDelete(reflectionId);

   if (!deletedReflection) {
      throw new ApiError(500, "Failed to delete reflection");
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            deletedReflection,
            "Reflection deleted successfully"
         )
      );
});

const getReflectionById = asyncHandler(async (req, res) => {
   const { reflectionId } = req.params;

   if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      throw new ApiError(400, "Invalid reflection ID");
   }

   const reflection = await Reflection.findById(reflectionId).populate(
      "user",
      "username"
   );

   if (!reflection) {
      throw new ApiError(404, "Reflection not found");
   }

   return res
      .status(200)
      .json(
         new ApiResponse(200, reflection, "Reflection fetched successfully")
      );
});

const getAllReflections = asyncHandler(async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 15;
   const skip = (page - 1) * limit;

   const { emotion, tag } = req.query;
   const filter = {};
   if (emotion) filter.emotion = emotion;
   if (tag) filter.tags = tag.toLowerCase();

   const totalReflections = await Reflection.countDocuments(filter);

   const reflections = await Reflection.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username");

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            { reflections, total: totalReflections, page, limit },
            "Reflections fetched successfully"
         )
      );
});

const getUserReflections = asyncHandler(async (req, res) => {
   const { userId } = req.params;

   if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
   }

   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 15;
   const skip = (page - 1) * limit;

   const filter = { user: userId };
   const totalReflections = await Reflection.countDocuments(filter);

   const reflections = await Reflection.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username");

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            { reflections, total: totalReflections, page, limit },
            "User's reflections fetched successfully"
         )
      );
});

export {
   createReflection,
   updateReflection,
   deleteReflection,
   getReflectionById,
   getAllReflections,
   getUserReflections,
};
