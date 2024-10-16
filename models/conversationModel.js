const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "users",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "messages",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const conversationModel =
  mongoose.models.conversations ||
  mongoose.model("conversations", conversationSchema);

module.exports = conversationModel;
