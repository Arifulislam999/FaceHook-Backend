const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  favouriteUser: [
    {
      loginUserId: {
        type: mongoose.Schema.ObjectId,
        ref: "users",
        required: true,
      },
      favouriteUserId: {
        type: mongoose.Schema.ObjectId,
        ref: "users",
        required: true,
      },
    },
    {
      timestamps: true,
    },
  ],
});

const favouriteModel =
  mongoose.models.favourites || mongoose.model("favourites", favouriteSchema);

module.exports = favouriteModel;
