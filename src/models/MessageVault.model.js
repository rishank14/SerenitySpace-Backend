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
      deliveredAt: {
         type: Date,
         default: null,
      },
   },
   { timestamps: true }
);

messageVaultSchema.index({ deliverAt: 1, delivered: 1 });
messageVaultSchema.index({ user: 1, delivered: 1, deliverAt: 1 });

const MessageVault =
   mongoose.models.MessageVault ||
   mongoose.model("MessageVault", messageVaultSchema);

export default MessageVault;
