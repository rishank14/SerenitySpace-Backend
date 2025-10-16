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
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
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
import messageVaultRouter from "./routes/messageVault.routes.js";
import chatbotRouter from "./routes/chatbot.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

// --- ROUTES ---
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vents", ventRouter);
app.use("/api/v1/reflections", reflectionRouter);
app.use("/api/v1/message-vault", messageVaultRouter);
app.use("/api/v1/chatbot", chatbotRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// --- ERROR HANDLING ---
app.use(errorMiddleware);

export default app;
