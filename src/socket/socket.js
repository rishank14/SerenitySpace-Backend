import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export function setupSocket(server) {
   io = new Server(server, {
      cors: {
         origin: process.env.CORS_ORIGIN,
         methods: ["GET", "POST"],
      },
   });

   // Authenticate on handshake using JWT
   io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      try {
         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
         socket.userId = decoded._id;
         next();
      } catch {
         next(new Error("Invalid or expired token"));
      }
   });

   io.on("connection", (socket) => {
      // Auto-join authenticated user to their own room
      socket.join(socket.userId);
      console.log(`User ${socket.userId} connected: ${socket.id}`);

      socket.on("disconnect", () => {
         console.log("Socket disconnected:", socket.id);
      });
   });
}

export function getIO() {
   return io;
}
