const express = require("express");
const notificationController = require("../controllers/notificationController");
const protectedRoute = require("../middleWare/authMiddleware");

const router = express.Router();

router.post(
  "/post-notifications",
  protectedRoute,
  notificationController.postNotificationAction
);
router.get(
  "/get-notifications",
  protectedRoute,
  notificationController.getNotification
);
module.exports = router;
