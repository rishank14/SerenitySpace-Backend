import cron from "node-cron";
import MessageVault from "../models/MessageVault.model.js";
import { getIO } from "../socket/socket.js";

export function startMessageDeliveryJob() {
   // Run every minute
   cron.schedule("* * * * *", async () => {
      const now = new Date();

      // Atomically find and mark as delivered one-by-one to prevent duplicates
      let msg;
      while (
         (msg = await MessageVault.findOneAndUpdate(
            { deliverAt: { $lte: now }, delivered: false },
            { $set: { delivered: true, deliveredAt: now } },
            { new: true }
         ))
      ) {
         try {
            // Emit to the user's room
            getIO().to(msg.user.toString()).emit("vaultDelivered", {
               _id: msg._id,
               message: msg.message,
               deliverAt: msg.deliverAt,
               delivered: true,
            });
         } catch (error) {
            console.error("Error emitting delivered message:", msg._id, error);
         }
      }
   });
}
