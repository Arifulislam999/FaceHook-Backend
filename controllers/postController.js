const asyncHandler = require("express-async-handler");
const cloudinaryService = require("../config/cloudinaryUploader");
const postModel = require("../models/postModel");
const userModel = require("../models/userModel");

class postController {
  static userPost = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      const image = req.file.path;
      const post = req.body.post;
      const { isValidEmail } = await userModel.findById(_id);
      if (isValidEmail) {
        if (_id) {
          if (image && post) {
            const response = await cloudinaryService(image);
            await postModel.create({
              creatorId: _id,
              poster: response.secure_url,
              description: post,
              likes: [],
              comments: [],
            });
            res.status(200).json({ message: "Create Post successfully." });
          } else {
            res
              .status(500)
              .json({ message: "Image or status not send in Server." });
          }
        } else {
          res
            .status(500)
            .json({ message: "Please Sign In Again!Token Expired." });
        }
      } else {
        res.status(400).json({ message: "Please verify your email." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Not allow to Post due to server error." });
    }
  });

  //   get ll post

  static getAllPost = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      if (_id) {
        const allPost = await postModel
          .find({ creatorId: { $ne: _id } })
          .sort({ createdAt: -1 })
          .populate("creatorId");

        res
          .status(200)
          .json({ message: "Success get all post.", data: allPost });
      } else {
        res.status(401).json({ message: "Please Login Again!Expired token." });
      }
    } catch (error) {
      res.status(500).json({ message: "Can't not get all post,Server Error." });
    }
  });

  // comment post
  static postComment = asyncHandler(async (req, res) => {
    try {
      const { id, text, userName, userImg } = req.body;

      const { _id } = req.user || {};
      const post = await postModel.findById(id);
      const findUser = await userModel.findById(_id);
      if (findUser) {
        if (findUser.isValidEmail) {
          if (post) {
            post.comments.push({
              commentUserId: _id,
              commentTitle: text,
              userName,
              userImg,
            });
            await post.save();
            res.status(200).json({ message: "Successfully submit comment." });
          } else {
            res.status(400).json({ message: "Post did not find" });
          }
        } else {
          res.status(400).json({ message: "Please verify your email." });
        }
      } else {
        res.status(400).json({ message: "User not found,please login again." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Can't not add post comment,Server Error." });
    }
  });
  static postLike = asyncHandler(async (req, res) => {
    try {
      const id = req.body.data.id;

      if (id) {
        const { _id } = req.user || {};
        if (_id) {
          const likePost = await postModel.findById(id);
          const likeUserIdExists = likePost.likes.some((like) =>
            like.likeUserId.equals(_id)
          );

          if (likeUserIdExists) {
            // i can also use filter method in js funciton
            likePost.likes.pull({ likeUserId: _id });
          } else {
            likePost.likes.push({
              likeUserId: _id,
            });
          }

          await likePost.save();

          res.status(200).json({
            message: "Success ",
            likeCount: likePost.likes.length,
          });
        } else {
          res.status(400).json({ message: "Error Login token expaire." });
        }
      } else {
        res.status(400).json({ message: "Error Not a valid User." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error did't add Like." });
    }
  });

  static getSinglePost = asyncHandler(async (req, res) => {
    try {
      const id = req.path.split("/")[2];

      const singlePost = await postModel
        .findById({ _id: id })
        .populate("creatorId");
      if (singlePost) {
        res.status(200).json({ message: "success", data: singlePost });
      } else {
        res.status(400).json({ message: "Not found single Post with by ID" });
      }
    } catch (error) {
      res.status(500).json({ message: "can not get single post." });
    }
  });

  static updatePost = asyncHandler(async (req, res) => {
    const path = req.path.split("/")[2];

    try {
      const image = req?.file?.path || "";
      const post = req.body.post;
      const existPost = await postModel.findById({ _id: path });
      if (existPost) {
        if (post && image && image !== "") {
          const responseUrl = await cloudinaryService(image);
          await postModel.findByIdAndUpdate(
            { _id: path },
            { $set: { poster: responseUrl.secure_url, description: post } },
            { new: true }
          );
          res.status(200).json({ message: "success edit your post." });
          return;
        } else if (post) {
          await postModel.findByIdAndUpdate(
            { _id: path },
            { $set: { description: post } },
            { new: true }
          );
          res.status(200).json({ message: "success edit your post." });
          return;
        } else {
          res
            .status(400)
            .json({ message: "Need your necessary critiantials." });
        }
      } else {
        res.status(400).json({ message: "can not find your post." });
      }
      res.status(200).json({ image, post });
    } catch (error) {
      res.status(500).json({ message: "can not update your post." });
    }
  });
  static deletePost = asyncHandler(async (req, res) => {
    const path = req.path.split("/")[2];
    try {
      await postModel.findByIdAndDelete({ _id: path });
      res.status(200).json({ message: "Delete your post." });
    } catch (error) {
      res.status(500).json({ message: "can not delete your post" });
    }
  });
}

module.exports = postController;
