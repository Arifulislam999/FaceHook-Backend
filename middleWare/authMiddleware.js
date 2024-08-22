const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const protectedRoute = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (token) {
      verifiedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const user = await userModel.findById({ _id: verifiedUser?.userId });
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({
          status: false,
          message: "Not a valid token",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Not authorized,please login,expire token.",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ status: false, message: "Not authorized,please login." });
  }
});
module.exports = protectedRoute;
