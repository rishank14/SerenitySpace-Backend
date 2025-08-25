import { Server } from "socket.io";

let io;
const userSocketMap = new Map(); // userId -> socketId

export function setupSocket(server) {
   io = new Server(server, {
      cors: {
         origin: process.env.CORS_ORIGIN,
         methods: ["GET", "POST"],
      },
   });

   io.on("connection", (socket) => {
      console.log("New socket connected:", socket.id);

      socket.on("register", (userId) => {
         userSocketMap.set(userId, socket.id);
         console.log(`User ${userId} registered with socket ${socket.id}`);
      });

      socket.on("disconnect", () => {
         for (const [userId, sockId] of userSocketMap.entries()) {
            if (sockId === socket.id) {
               userSocketMap.delete(userId);
               break;
            }
         }
         console.log("Socket disconnected:", socket.id);
      });
   });
}

export function getIO() {
   return io;
}

export function getUserSocket(userId) {
   return userSocketMap.get(userId);
}
