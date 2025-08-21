import mongoose from "mongoose";

const messageVaultSchema = new mongoose.Schema(
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
         maxlength: 2000,
      },
      deliverAt: {
         type: Date,
         required: true,
      },
      delivered: {
         type: Boolean,
         default: false,
      },
   },
   { timestamps: true }
);

const MessageVault =
   mongoose.models.MessageVault ||
   mongoose.model("MessageVault", messageVaultSchema);

export default MessageVault;
