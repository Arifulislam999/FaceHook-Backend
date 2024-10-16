const express = require("express");
const protectedRoute = require("../middleWare/authMiddleware");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.get("/chat-list", protectedRoute, chatController.getAllChatFollower);
router.post("/send", protectedRoute, chatController.sendMessage);
router.get("/get-message/:id", protectedRoute, chatController.getMessage);
router.get(
  "/get-singleuser-for-chat/:id",
  protectedRoute,
  chatController.getSingleUserForChat
);

module.exports = router;
