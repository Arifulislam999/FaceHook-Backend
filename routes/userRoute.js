const express = require("express");
const userController = require("../controllers/userController");
const protectedRoute = require("../middleWare/authMiddleware");
const uploaderMulter = require("../config/uploadMulter");

const router = express.Router();
// Not Proceted route

router.post("/register", userController.userRegistation);
router.post("/login", userController.userLogin);
router.get("/loggedin", protectedRoute, userController.userLoggedInStatus);
router.get("/logout", userController.userLogOut);

// protected Route
router.get("/activation-account", userController.activateUserAccount);
router.patch("/updatebio", protectedRoute, userController.userBioUpdate);
router.get("/single-user/:id", protectedRoute, userController.getSingleUser);
router.patch("/followers", protectedRoute, userController.addFollower);
router.patch(
  "/upload-image",
  protectedRoute,
  (req, res, next) => {
    uploaderMulter.single("image")(req, res, (err) => {
      if (err) {
        // Handle file size limit error
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size is too large. Maximum size is 500KB.",
          });
        }
        // Handle other multer errors
        return res.status(500).json({
          success: false,
          message: "An error occurred while uploading the file.",
        });
      }
      // If no errors, pass control to the next handler
      next();
    });
  },
  userController.uploadImage
);

module.exports = router;
//  uploaderMulter.single("image"),
