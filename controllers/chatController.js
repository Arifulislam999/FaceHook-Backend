const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const conversationModel = require("../models/conversationModel");
const messageModel = require("../models/messageModel");

class chatController {
  static getAllChatFollower = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      let id = req.query.id || _id;
      if (id) {
        const followerUser = await userModel
          .find({
            followers: {
              $elemMatch: { followerUserId: id, followStatus: "success" },
            },
          })
          .select(["-password", "-followers"]);
        let followerUserArray = [];
        followerUser?.forEach((f) => followerUserArray.push(f?._id));

        // collect message

        let messages;
        if (followerUserArray) {
          messages = await Promise.all(
            followerUserArray?.map(async (followerId) => {
              const conversation = await conversationModel
                .findOne({
                  participants: { $all: [id, followerId] },
                })
                .populate({
                  path: "messages",
                  options: { sort: { _id: -1 }, limit: 1 }, // Sort by _id in descending order, limit to 1
                });

              return conversation;
            })
          );
        }
        const updateData = followerUser?.map((user) => {
          const matchMessage = messages.find((message) =>
            message?.participants.includes(user._id)
          );
          if (matchMessage) {
            return {
              ...user,
              messages: matchMessage.messages,
            };
          }
          return user;
        });

        res.status(200).json({
          message: "success",
          status: true,
          lastmessage: updateData,
        });
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

  static sendMessage = asyncHandler(async (req, res) => {
    try {
      const message = req.body.data.text || "";
      const receiverId = req.body.data.id || "";
      const { _id: senderId } = req.user || {};
      if (message !== "" || message !== null || message !== undefined) {
        const conversation = await conversationModel.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
          conversation = await conversationModel.create({
            participants: [senderId, receiverId],
          });
        }

        const newMessage = new messageModel({
          senderId,
          receiverId,
          message,
        });

        if (newMessage) {
          await conversation.messages.push(newMessage?._id);
        }
        await Promise.all([conversation.save(), newMessage.save()]);
        res.status(201).json({ message: newMessage });
      } else {
        res.status(400).json({ message: "Error your message may be null." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error did't send any message." });
    }
  });
  static getMessage = asyncHandler(async (req, res) => {
    try {
      const { id: receiverId } = req.params || {};
      const { _id: senderId } = req.user || {};
      const conversation = await conversationModel
        .findOne({
          participants: { $all: [senderId, receiverId] },
        })
        .populate("messages");
      if (!conversation) {
        return res
          .status(200)
          .json({ message: [], desc: "No Conversation Yet." });
      } else {
        const message = conversation.messages;
        return res.status(200).json({ message, desc: "All Conversations" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error can't find any message." });
    }
  });

  static getSingleUserForChat = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params || {};

      if (id) {
        const chatUser = await userModel.findOne({ _id: id });
        if (chatUser) {
          res.status(200).json({ message: "success", data: chatUser });
        } else {
          res
            .status(400)
            .json({ message: "Error can't find user or not received Id" });
        }
      } else {
        res.status(400).json({ message: "Error can't find user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error can't find any single User." });
    }
  });
}

module.exports = chatController;
