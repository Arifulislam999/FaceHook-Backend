const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "posts",
    },
    postCreatorId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    reactUserId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    reactUserImg: {
      type: String,
      required: true,
    },
    actionCreatorName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const notificationModel =
  mongoose.models.notifications ||
  mongoose.model("notifications", notificationSchema);
module.exports = notificationModel;
