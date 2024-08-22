const express = require("express");
const postController = require("../controllers/postController");
const protectedRoute = require("../middleWare/authMiddleware");
const uploaderMulter = require("../config/uploadMulter");

const router = express.Router();

router.post(
  "/post",
  protectedRoute,
  uploaderMulter.single("image"),
  postController.userPost
);

router.get("/all-post", protectedRoute, postController.getAllPost);
router.post("/comment-post", protectedRoute, postController.postComment);
router.post("/like", protectedRoute, postController.postLike);

module.exports = router;
