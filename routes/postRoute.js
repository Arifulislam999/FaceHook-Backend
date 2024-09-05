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
router.get("/single-post/:id", protectedRoute, postController.getSinglePost);
router.delete("/delete-post/:id", protectedRoute, postController.deletePost);
router.put(
  "/update-post/:id",
  protectedRoute,
  uploaderMulter.single("image"),
  postController.updatePost
);

module.exports = router;
