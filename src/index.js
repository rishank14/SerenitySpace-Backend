import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import app from "./app.js";
import http from "http";
import { setupSocket } from "./socket/socket.js";
import { startMessageDeliveryJob } from "./cron/messageDelivery.js";

dotenv.config({
   path: "./.env",
});

const server = http.createServer(app);
setupSocket(server);
startMessageDeliveryJob();
connectDB()
   .then(() => {
      server.listen(process.env.PORT || 7000, () => {
         console.log(`Server is running on port ${process.env.PORT || 7000}`);
      });
   })
   .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      process.exit(1);
   });
