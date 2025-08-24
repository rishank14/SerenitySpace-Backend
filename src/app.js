import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

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

// --- ROUTES IMPORT ---
import userRouter from "./routes/user.routes.js";
import ventRouter from "./routes/vent.routes.js";
import reflectionRouter from "./routes/reflection.routes.js";

// --- ROUTES ---
app.use("/api/users", userRouter);
app.use("/api/vents", ventRouter);
app.use("/api/reflections", reflectionRouter);

// --- ERROR HANDLING ---
app.use(errorMiddleware);

export default app;
