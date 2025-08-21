import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import app from "./app.js";

dotenv.config({
   path: "./.env",
});

connectDB()
   .then(() => {
      app.listen(process.env.PORT || 7000, () => {
         console.log(`Server is running on port ${process.env.PORT || 7000}`);
      });
   })
   .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      process.exit(1); // ⛔ Exit if DB fails to connect
   });
