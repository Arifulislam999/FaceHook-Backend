const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const validEmailChacker = require("../utils/validEmailChecker");
const cloudinaryService = require("../config/cloudinaryUploader");
const sendEmailNodeMailer = require("../utils/sendEmail");
const postModel = require("../models/postModel");
const notificationModel = require("../models/notificationModel");
// Generate Web Token.
const generateToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
};

class userController {
  static userRegistation = asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password,
      isValidEmail,
      bio,
      followers,
      profile,
      dp,
    } = req.body.data;

    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      if (firstName && lastName && email && password) {
        if (password.length <= 4) {
          res.status(400).json({
            status: false,
            message: "Your Password is so short.",
          });
        } else if (!validEmailChacker(email)) {
          res
            .status(400)
            .json({ status: false, message: "Please add valid email" });
        } else {
          const salt = await bcrypt.genSalt(10);
          const hashPassword = await bcrypt.hash(password, salt);
          const user = await userModel.create({
            firstName,
            lastName,
            password: hashPassword,
            email,
            isValidEmail,
            bio,
            profile,
            followers,
            dp,
          });
          if (user) {
            const { _id } = user;
            const token = generateToken(_id);
            // console.log("Token", token);
            res.cookie("token", token, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
              maxAge: 86400000,
            });

            // prepare email
            const emailData = {
              email,
              subject: "Account Activation Email.",
              html: `<h2>Hello ${firstName} ${lastName}!</h2>
              <p>Please click here to activate your <h3>LinkSy</h3> account <a href="${process.env.SERVER_URL}/api/user/activation-account?token=${token}" target="_blank">Activate Account</a></p>
              `,
            };

            try {
              await sendEmailNodeMailer(emailData);
              res.status(201).json({
                status: true,
                message: "user is created.",
                data: user,
                token: token,
              });
            } catch (error) {
              await userModel.deleteOne(_id);
              res.status(400).json({
                status: false,
                message: "server error occured.",
                orginalMessage: error,
              });
            }
          } else {
            res.status(400).json({
              status: false,
              message: "Invalid user data.",
            });
          }
        }
      } else {
        res.status(400).json({
          status: false,
          message: "please fill all input box.",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        message: "user already exist.",
      });
    }
  });

  // login controller
  static userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body.data;

    const findUser = await userModel.findOne({ email: email });
    if (!findUser) {
      res.status(400).json({
        status: false,
        message: "This user not signed in",
        data: null,
      });
    } else {
      const matchPassword = await bcrypt.compare(password, findUser.password);
      if (!matchPassword) {
        res.status(400).json({
          status: false,
          message: "Password does't match.",
          data: null,
        });
      } else {
        const { _id } = findUser;
        // generate token
        const token = generateToken(_id);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 86400000,
        });

        res.status(200).json({
          status: true,
          message: "success",
          // data: { ...findUser?._doc, token },
          data: findUser,
          token,
        });
      }
    }
  });

  // logout Status

  static userLogOut = asyncHandler(async (req, res) => {
    // reactCookis.remove("token", { path: "/api/user/loggedin" });
    console.log("logout");
    res.clearCookie("token");
    res.status(200).json("user successfully Logged Out.");
  });

  // loggedin Status
  static userLoggedInStatus = asyncHandler(async (req, res) => {
    const token = req.headers["authorization"];

    if (!token) {
      res.status(403).json({
        status: false,
        message: "user unauthrizated.",
      });
      return;
    }
    const decode = jwt.decode(token, process.env.JWT_SECRET_KEY);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (decode && decode.exp) {
      if (decode.exp >= currentTimestamp) {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (verified) {
          const user = await userModel
            .findById({
              _id: verified?.userId,
            })
            .select("-password");
          if (user) {
            res.json({
              status: true,
              message: "user Log in Successfully.",
              data: user,
            });
            return;
          } else {
            res.json({
              status: false,
              message: "not a valid user.",
            });
            return;
          }
        } else {
          res.json({
            status: false,
            message: "Not Valid user.",
          });
          return;
        }
      } else {
        res.json({
          status: false,
          message: "Login status expired.",
        });
        return;
      }
    }
    return res.status(400).json({ status: false, message: "user not LonIn" });
  });
  // user bio update
  static userBioUpdate = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      const user = await userModel.findById(_id).select("-password");

      if (user) {
        await userModel.findByIdAndUpdate(
          _id,
          { bio: req.body.data },
          { new: true }
        );
        const updateUser = await userModel.findById(_id).select("-password");

        res.status(200).json({
          status: true,
          message: "success update user data information.",
          data: updateUser,
        });
      } else {
        res.status(400).json({ message: "User Not Fount!." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  });
  static uploadImage = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      const user = await userModel.findById(_id).select("-password");
      const { dp, profile } = user;
      const image = req.file?.path;
      if (user) {
        if (image) {
          const response = await cloudinaryService(image);
          // dp and profile change additional data send from front end
          if (req.body.picture === "dp") {
            await userModel.findByIdAndUpdate(
              _id,
              { dp: response.secure_url || dp },
              { new: true }
            );
            const updateUser = await userModel
              .findById(_id)
              .select("-password");

            res.status(200).json({
              status: true,
              message: "success update user dp Picture.",
              data: updateUser,
            });
          } else {
            await userModel.findByIdAndUpdate(
              _id,
              { profile: response.secure_url || profile },
              { new: true }
            );
            const updateUser = await userModel
              .findById(_id)
              .select("-password");

            res.status(200).json({
              status: true,
              message: "success update user Profile Picture.",
              data: updateUser,
            });
          }
        } else {
          res
            .status(500)
            .json({ message: "Image Not Change Due Server Not Response." });
        }
      } else {
        res.status(500).json({ message: "User Not Found." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  //Account Activation
  static activateUserAccount = asyncHandler(async (req, res) => {
    const token = req.query.token;
    if (token) {
      const verifiedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (verifiedUser) {
        await userModel.findByIdAndUpdate(
          { _id: verifiedUser?.userId },
          { isValidEmail: true },
          { new: true }
        ),
          res.redirect(`${process.env.CLIENT_URL}`);
        return;
      } else {
        res.status(400).json({
          status: false,
          message: "Not verified email user.",
        });
        return;
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Email Not Received.",
      });
      return;
    }
  });

  // single user find out
  static getSingleUser = asyncHandler(async (req, res) => {
    const pathName = req.path.split("/")[2];
    try {
      const singleUser = await userModel.findOne({ _id: pathName });
      const singleUserPost = await postModel
        .find({ creatorId: pathName })
        .populate("creatorId")
        .sort({ createdAt: -1 });
      if (singleUser) {
        res.status(200).json({
          message: "Find single user.",
          data: singleUser,
          singleUserPost,
        });
      } else {
        res.status(500).json({ message: "Can not get path and user." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error find single user" });
    }
  });
  // follower
  static addFollower = asyncHandler(async (req, res) => {
    try {
      const id = req.body.data.userId;

      if (id) {
        const { _id } = req.user || {};
        if (_id) {
          const followerUser = await userModel.findById(id);
          const myFollower = await userModel.findById(_id);
          const followerExists = followerUser.followers.some((follower) =>
            follower.followerUserId.equals(_id)
          );

          if (followerExists) {
            followerUser.followers = followerUser.followers.filter(
              (follower) => !follower.followerUserId.equals(_id)
            );
            // remove form my account follower
            myFollower.followers = myFollower.followers.filter(
              (follower) => !follower.followerUserId.equals(id)
            );
          } else {
            followerUser.followers.push({
              followerUserId: _id,
              followStatus: "pending",
            });
          }
          await followerUser.save();
          await myFollower.save();

          res.status(200).json({ message: "success" });
        } else {
          res.status(400).json({ message: "Error Login token expaire." });
        }
      } else {
        res.status(400).json({ message: "Error Not a valid User." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error did't add follower." });
    }
  });

  // follow decline controller

  static followDecline = asyncHandler(async (req, res) => {
    try {
      const followerId = req.body.data.reactUserId || {};
      const notificationId = req.body.data.notificationId || {};

      if (followerId) {
        const { _id } = req.user || {};
        if (_id) {
          const me = await userModel.findById(_id);
          const followerExists = me.followers.some((follower) =>
            follower.followerUserId.equals(followerId)
          );

          if (followerExists) {
            me.followers = me.followers.filter(
              (follower) => !follower.followerUserId.equals(followerId)
            );
            await notificationModel.findByIdAndUpdate(
              {
                _id: notificationId,
              },
              { actionFollowStatus: "decline" },
              { new: true }
            );

            await me.save();
            res.status(200).json({ message: "success" });
          } else {
            res.status(400).json({ message: "Did't follow you this person." });
          }
        } else {
          res.status(400).json({ message: "Error Login token expaire." });
        }
      } else {
        res.status(400).json({ message: "Error did't received any Id" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error did't decline follower." });
    }
  });

  // followerAccept

  static followerAccept = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user || {};
      const followUserId = req.body.data.reactUserId;
      const notificationId = req.body.data.notificationId;
      const me = await userModel.findById(_id);
      const followerUser = await userModel.findById({ _id: followUserId });
      if (me && followerUser) {
        await userModel.updateOne(
          {
            _id,
            "followers.followerUserId": followUserId,
          },
          { $set: { "followers.$.followStatus": "success" } }
        );
        const ll = await userModel.updateOne(
          { _id: followUserId },
          {
            $push: {
              followers: { followStatus: "success", followerUserId: _id },
            },
          }
        );
        await notificationModel.findByIdAndUpdate(
          {
            _id: notificationId,
          },
          { actionFollowStatus: "success" },
          { new: true }
        );
        res.status(200).json({ ll });
      } else {
        res
          .status(400)
          .json({ message: "Error did't find any login or follower user." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error did't accept follower.due to server error" });
    }
  });

  //reset password
  static resetPassword = asyncHandler(async (req, res) => {
    const email = req.body.data;
    try {
      const existUser = await userModel.findOne({ email: email });

      if (existUser && email) {
        const { _id, firstName, lastName } = existUser;
        const resetToken = generateToken(_id);
        res.cookie("resetPasswordToken", resetToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 600000, // 10 minutes in milliseconds
        });

        // prepare email
        const emailData = {
          email,
          subject: "Reset Password With Email",
          html: `<h2>Hello ${firstName} ${lastName}!</h2>         
              <p> The validity of this verification link is only 10 minutes, if the password is not changed within 10 minutes then this link will lose its ability to work. <br/><br/> Please click here to reset your LinkSy account password <a href="${process.env.CLIENT_URL}/confirm-password?token=${resetToken}&id=${_id}" target="_blank">Reset Password</a></p>
              `,
        };
        await sendEmailNodeMailer(emailData);
        res
          .status(200)
          .json({ message: "Success! Sending,Check Your Email Address." });
      } else {
        res.status(500).json({ message: "This email does't sign up yet." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "User not find or user credential missing." });
    }
  });

  // confirm password

  static confirmPassword = asyncHandler(async (req, res) => {
    const { token, password, id } = req.body.data;
    try {
      const user = await userModel.findById({ _id: id });
      if (user) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (password.length > 7) {
          if (verified) {
            await userModel.findByIdAndUpdate(
              { _id: id },
              { password: hashPassword },
              { new: true }
            );
            res.status(200).json({
              message: "Changed your password successfully.",
              status: true,
            });
            return;
          } else {
            res.status(401).json({
              message: "Token expired or invalid token.",
              status: false,
            });
          }
        } else {
          res.status(401).json({
            message: "Password must be 8 character or more.",
            status: false,
          });
        }
      } else {
        res
          .status(400)
          .json({ message: "User credential missing.", status: false });
      }
    } catch (error) {
      res.status(500).json({
        message: "User not find or user credential missing.",
        status: false,
      });
    }
  });
}
module.exports = userController;
