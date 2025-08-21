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
      emotion: {
         type: String,
         enum: ["sad", "angry", "anxious", "happy", "neutral"],
         default: "neutral",
      },
   },
   { timestamps: true }
);

const Vent = mongoose.models.Vent || mongoose.model("Vent", ventSchema);

export default Vent;
