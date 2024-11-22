const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

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

    console.log("Active users:", activeUsers);

    // Send the updated list of active users to all clients
    io.emit(
      "activeUsers:update",
      activeUsers.map((user) => user.userId)
    );
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
