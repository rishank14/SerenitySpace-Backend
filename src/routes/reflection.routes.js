import { Router } from "express";
import {
   createReflection,
   updateReflection,
   deleteReflection,
   getReflectionById,
   getAllReflections,
   getUserReflections,
} from "../controllers/reflection.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//NOTE: Get all reflections, For testing only
router.route("/").get(verifyJWT, getAllReflections);

// Get a single reflection by ID
router.route("/:reflectionId").get(verifyJWT, getReflectionById);

// Get all reflections of a specific user
router.route("/user/:userId").get(verifyJWT, getUserReflections);

// Protected routes: user must be logged in
router.route("/create").post(verifyJWT, createReflection);
router.route("/update/:reflectionId").patch(verifyJWT, updateReflection);
router.route("/delete/:reflectionId").delete(verifyJWT, deleteReflection);

export default router;
