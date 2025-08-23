import mongoose from "mongoose";

const ventSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      message: {
         type: String,
         required: true,
         trim: true,
         maxlength: 1000,
      },
      mood: {
         type: String,
         enum: ["sad", "angry", "anxious", "happy", "neutral"],
         default: "neutral",
      },
      visibility: {
         type: String,
         enum: ["public", "private"],
         default: "private",
      },
   },
   { timestamps: true }
);

const Vent = mongoose.models.Vent || mongoose.model("Vent", ventSchema);

export default Vent;
