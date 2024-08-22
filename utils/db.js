const mongoose = require("mongoose");
let isConnected = false;
const connectDB = async () => {
  mongoose.set("strictQuery", true);
  if (isConnected) {
    console.log("MongoDB is already connected.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("db is running");
  } catch (error) {
    console.log("db is connected Error");
  }
};
module.exports = connectDB;
