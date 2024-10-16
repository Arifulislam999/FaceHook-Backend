const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: [true, "Please add a First Name."],
  },
  lastName: {
    type: String,
    require: [true, "Please add a Last Name."],
  },
  email: {
    type: String,
    require: [true, "Please add an Email."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please add an password"],
  },
  isValidEmail: {
    type: Boolean,
    required: false,
  },
  followers: [
    {
      followerUserId: {
        type: mongoose.Schema.ObjectId,
        ref: "users",
      },
      followStatus: {
        type: String,
        required: false,
        default: "no",
      },
    },
  ],
  bio: {
    type: String,
    required: false,
  },
  profile: {
    type: String,
    required: false,
    default:
      "https://static.vecteezy.com/system/resources/previews/009/383/461/non_2x/man-face-clipart-design-illustration-free-png.png",
  },
  dp: {
    type: String,
    required: false,
    default:
      "https://st4.depositphotos.com/5934840/28236/v/450/depositphotos_282365260-stock-illustration-young-man-avatar-cartoon-character.jpg",
  },
});

const userModel = mongoose.models.users || mongoose.model("users", userSchema);

module.exports = userModel;
