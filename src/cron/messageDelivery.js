import cron from "node-cron";
import MessageVault from "../models/MessageVault.model.js";
import { getIO, getUserSocket } from "../socket/socket.js";

export function startMessageDeliveryJob() {
   // Run every minute
   cron.schedule("* * * * *", async () => {
      const now = new Date();

      const dueMessages = await MessageVault.find({
         deliverAt: { $lte: now },
         delivered: false,
      });

      for (const msg of dueMessages) {
         try {
            const socketId = getUserSocket(msg.user.toString());

            if (socketId) {
               getIO().to(socketId).emit("newMessageVault", {
                  messageId: msg._id,
                  message: msg.message,
                  deliverAt: msg.deliverAt,
               });
            }

            msg.delivered = true;
            await msg.save();
         } catch (error) {
            console.error("Error delivering message:", msg._id, error);
         }
      }
   });
}
