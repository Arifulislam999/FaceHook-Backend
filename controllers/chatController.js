const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

class chatController {
  static getAllChatFollower = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      if (_id) {
        const followerUser = await userModel.find({
          followers: {
            $elemMatch: { followerUserId: _id },
          },
        });
        res
          .status(200)
          .json({ message: "success", data: followerUser, status: true });
        return;
      } else {
        res
          .status(400)
          .json({ message: "Please Sign In Again!Token Expired." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error did't find any Follower Member." });
    }
  });
}

module.exports = chatController;
