const express = require("express");
const protectedRoute = require("../middleWare/authMiddleware");
const favouriteController = require("../controllers/favouriteController");

const router = express.Router();
// Not Proceted route
router.post(
  "/add-favourite-user",
  protectedRoute,
  favouriteController.addFavourite
);
router.get(
  "/get-favourite/:id",
  protectedRoute,
  favouriteController.getFavouriteUser
);
router.get(
  "/get-favourites",
  protectedRoute,
  favouriteController.getFavouriteUsers
);

module.exports = router;
