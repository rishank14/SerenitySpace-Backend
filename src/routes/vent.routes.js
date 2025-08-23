import { Router } from "express";
import {
   createVent,
   updateVent,
   deleteVent,
   getVentById,
   getAllVents,
   getUserVents,
} from "../controllers/vent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public and private vents routes
router.route("/").get(verifyJWT, getAllVents); // All vents: public + own private
router.route("/:ventId").get(verifyJWT, getVentById); // Single vent by ID
router.route("/user/:userId").get(verifyJWT, getUserVents); // Vents of a specific user

// Protected routes: user must be logged in
router.route("/create").post(verifyJWT, createVent);
router.route("/update/:ventId").patch(verifyJWT, updateVent);
router.route("/delete/:ventId").delete(verifyJWT, deleteVent);

export default router;
