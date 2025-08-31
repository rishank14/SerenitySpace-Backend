import { Server } from "socket.io";

let io;

export function setupSocket(server) {
   io = new Server(server, {
      cors: {
         origin: process.env.CORS_ORIGIN,
         methods: ["GET", "POST"],
      },
   });

   io.on("connection", (socket) => {
      console.log("New socket connected:", socket.id);

      // Join the user to a room named by their userId
      socket.on("register", (userId) => {
         socket.join(userId);
         console.log(`User ${userId} joined room ${userId}`);
      });

      socket.on("disconnect", () => {
         console.log("Socket disconnected:", socket.id);
         // No need to track individual socket IDs
      });
   });
}

export function getIO() {
   return io;
}
