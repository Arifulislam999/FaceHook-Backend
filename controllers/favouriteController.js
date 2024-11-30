const asyncHandler = require("express-async-handler");
const favouriteModel = require("../models/favouriteModel");
class favouriteController {
  // favourite user
  static addFavourite = asyncHandler(async (req, res) => {
    try {
      const id = req.body.data;

      if (id) {
        const { _id } = req.user || {};

        if (_id) {
          let loginUser = await favouriteModel.findOne({
            favouriteUser: {
              $elemMatch: {
                loginUserId: _id,
              },
            },
          });

          // If no document exists, create a new one
          if (!loginUser) {
            loginUser = new favouriteModel({
              favouriteUser: [],
            });
          }

          // Check if the favourite user already exists
          const favouriteExists = loginUser.favouriteUser.some((favourite) =>
            favourite.favouriteUserId.equals(id)
          );

          if (favouriteExists) {
            // Remove the favourite user if it already exists
            loginUser.favouriteUser = loginUser.favouriteUser.filter(
              (favourite) => !favourite.favouriteUserId.equals(id)
            );
          } else {
            // Add the favourite user if it does not exist
            loginUser.favouriteUser.push({
              loginUserId: _id,
              favouriteUserId: id,
            });
          }
          // Save the updated document
          await loginUser.save();

          res.status(200).json({
            message: favouriteExists
              ? "Favourite user removed successfully."
              : "Favourite user added successfully.",
          });
        } else {
          res.status(401).json({ message: "Error Login token expaire." });
        }
      } else {
        res.status(400).json({ message: "No favourite user ID provided." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error did't add favourite user." });
    }
  });

  static getFavouriteUser = asyncHandler(async (req, res) => {
    const { _id } = req.user || {};
    const { id } = req.params || {};

    try {
      if (_id && id) {
        const user = await favouriteModel.findOne({
          favouriteUser: {
            $elemMatch: {
              favouriteUserId: id,
            },
          },
        });
        let existUser = user?.favouriteUser?.some(
          (u) => u.favouriteUserId == id
        );

        res.status(200).json({
          message: "success",
          status: user ? (existUser ? true : false) : false,
          user,
        });
      } else {
        res.status(401).json({ message: "Error Login token expaire." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error can't get favourite user." });
    }
  });

  static getFavouriteUsers = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      if (_id) {
        const user = await favouriteModel.findOne({
          favouriteUser: {
            $elemMatch: {
              loginUserId: _id,
            },
          },
        });
        let userarray = [];
        if (user) {
          user?.favouriteUser?.map((obId) =>
            userarray.push(obId.favouriteUserId)
          );
        }
        res.status(200).json({
          message: "success",
          data: userarray,
          status: user ? true : false,
        });
      } else {
        res.status(401).json({ message: "Error Login token expaire." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error can't get favourite user." });
    }
  });
}

module.exports = favouriteController;
