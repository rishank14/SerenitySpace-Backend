import cron from "node-cron";
import MessageVault from "../models/MessageVault.model.js";
import { getIO } from "../socket/socket.js";

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
            // Emit to the user's room
            getIO().to(msg.user.toString()).emit("vaultDelivered", {
               _id: msg._id,
               message: msg.message,
               deliverAt: msg.deliverAt,
               delivered: true,
            });

            msg.delivered = true;
            await msg.save();
         } catch (error) {
            console.error("Error delivering message:", msg._id, error);
         }
      }
   });
}
