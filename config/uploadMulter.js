const express = require("express");
const user = express();
const path = require("path");
const bodyParsar = require("body-parser");
user.use(bodyParsar.urlencoded({ extended: true }));
user.use(express.static(path.resolve(__dirname, "public")));

const multer = require("multer");
const uploaderMulter = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5200000 },
});

module.exports = uploaderMulter;
