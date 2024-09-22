import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    receiverId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const messageModel =
  mongoose.models.messages || mongoose.model("messages", messageSchema);
module.exports = messageModel;
