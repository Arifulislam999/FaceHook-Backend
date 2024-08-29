const asyncHandler = require("express-async-handler");
const notificationModel = require("../models/notificationModel");

class notificationController {
  static postNotificationAction = asyncHandler(async (req, res) => {
    try {
      const user = req.user || {};
      const { postId, postCreatorId, action } = req.body.data || {};

      if (user) {
        const { firstName, lastName, profile, _id } = user || {};
        if (postId && postCreatorId && action) {
          const notification = await notificationModel.create({
            postId,
            postCreatorId,
            action,
            reactUserId: _id,
            reactUserImg: profile,
            actionCreatorName: firstName + " " + lastName,
          });

          if (notification) {
            res.status(201).json({
              message: "success created notification post.",
            });
          } else {
            res.status(400).json({
              status: false,
              message: "Invalid user data or notification information.",
            });
          }
        } else {
          res.status(400).json({ message: "Please fill all input." });
        }
      } else {
        res.status(400).json({ message: "Login User Not Found!" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error did't find/create any Notifications." });
    }
  });

  // get notification
  static getNotification = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      if (_id) {
        const changeNotification = await notificationModel
          .find({
            postCreatorId: _id,
          })
          .sort({ createdAt: -1 });
        res.status(200).json({
          message: "success",
          notification: changeNotification,
        });
      } else {
        res.status(400).json({ message: "Login User Not Found!" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error did't find any Notifications." });
    }
  });
}
module.exports = notificationController;
