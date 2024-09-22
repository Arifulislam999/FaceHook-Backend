const express = require("express");
const protectedRoute = require("../middleWare/authMiddleware");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.get("/chat-list", protectedRoute, chatController.getAllChatFollower);

module.exports = router;
