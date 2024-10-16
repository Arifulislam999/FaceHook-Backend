const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    poster: {
      type: String,
      required: true,
      default:
        "https://st4.depositphotos.com/5934840/28236/v/450/depositphotos_282365260-stock-illustration-young-man-avatar-cartoon-character.jpg",
    },
    description: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: false,
    },
    likes: [
      {
        likeUserId: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
      },
    ],
    comments: [
      {
        commentUserId: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
        commentTitle: {
          type: String,
        },
        userImg: {
          type: String,
          required: true,
          default:
            "https://st4.depositphotos.com/5934840/28236/v/450/depositphotos_282365260-stock-illustration-young-man-avatar-cartoon-character.jpg",
        },
        userName: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const postModel = mongoose.models.posts || mongoose.model("posts", postSchema);
module.exports = postModel;
