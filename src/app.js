import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// Middleware
app.use(
   cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
   })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// --- TEST ROUTE ---
app.get("/", (req, res) => {
   res.send("🧠 SerenitySpace backend is live!");
});

// --- ROUTES ---
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes); // for user activity, vents, reflections, etc.

// --- ERROR HANDLING ---
app.use(errorMiddleware);

export default app;
