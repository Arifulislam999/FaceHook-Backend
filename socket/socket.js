const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const mongodbTime = require("../utils/mongodbTime");
const userModel = require("../models/userModel");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

let activeUsers = []; // Array to store active user IDs
io.on("connection", async (socket) => {
  // console.log("a user connected.", socket.id);

  // Handle user joining with an ID
  socket.on("user:join", (userId) => {
    const isUserAlreadyActive = activeUsers.some(
      (user) => user.userId === userId
    );
    if (!isUserAlreadyActive) {
      activeUsers.push({ userId, socketId: socket.id }); // Add user to active list
    }

    // console.log("Active users:", activeUsers);

    // Send the updated list of active users to all clients
    io.emit(
      "activeUsers:update",
      activeUsers.map((user) => user.userId)
    );
  });

  // Save socketId when a user connects
  socket.on("register", async ({ userId }) => {
    await userModel.findByIdAndUpdate(
      userId,
      { socketId: socket.id },
      { new: true }
    );
    // console.log(`User registered with socket: ${socket.id}`);
  });

  // Handle sending a message to a specific user

  socket.on("send_message", async ({ senderId, receiverId, message }) => {
    // sample test further change
    const receiver = await userModel.findById(receiverId);
    const sender = await userModel.findById(senderId);
    if (receiver && receiver?.socketId) {
      let newMessage = {
        senderId,
        receiverId,
        message,
        createdAt: mongodbTime(),
      };
      io.to(receiver?.socketId).emit("receive_message", newMessage);
      io.to(sender?.socketId).emit("receive_message", newMessage);
      io.emit("receive_message_left", newMessage);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    // Remove the user from the active users list using their socket ID
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);

    // console.log("Active users after disconnect:", activeUsers);

    // Send the updated list of active users to all clients
    io.emit(
      "activeUsers:update",
      activeUsers.map((user) => user.userId)
    );
  });
});
module.exports = { app, server, io };
