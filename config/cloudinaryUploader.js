const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryService = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "FaceHook",
    });
    return result;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = cloudinaryService;
