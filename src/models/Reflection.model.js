import mongoose from "mongoose";

const reflectionSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      title: {
         type: String,
         trim: true,
         maxlength: 100,
         default: "Untitled",
      },
      content: {
         type: String,
         required: true,
         trim: true,
         maxlength: 2500,
      },
      emotion: {
         type: String,
         enum: ["sad", "angry", "anxious", "happy", "neutral"],
         default: "neutral",
      },
      tags: [
         {
            type: String,
            trim: true,
            lowercase: true,
         },
      ],
   },
   { timestamps: true }
);

const Reflection =
   mongoose.models.Reflection || mongoose.model("Reflection", reflectionSchema);

export default Reflection;
