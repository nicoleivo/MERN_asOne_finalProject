import express from "express";
import multer from "multer";
import path from "path";
import cloudinary from "cloudinary";
import { v2 as cloudinaryV2 } from "cloudinary";

const router = express.Router();

// Configure Cloudinary
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (no files saved locally)
const storage = multer.memoryStorage();

// Restrict file types
function checkFileType(file, callback) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return callback(null, true);
  } else {
    callback("Images with jpg, jpeg, webp or png file extension only!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, callback) {
    checkFileType(file, callback);
  },
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        {
          folder: "asone_uploads", // Optional: organize in folder
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert buffer to stream and upload
      uploadStream.end(req.file.buffer);
    });

    // Return Cloudinary URL
    res.json(result.secure_url);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

export default router;
