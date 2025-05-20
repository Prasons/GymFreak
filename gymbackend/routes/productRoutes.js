import express from "express";
import multer from "multer";
import { adminProtect } from "../middlewares/authMiddleware.js";
import {
  addProduct,
  getProducts,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Unique filename
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
  fileFilter: fileFilter
});

// Get all products
router.get("/", getProducts);

// Create a new product
router.post("/", 
  adminProtect, 
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        // An unknown error occurred
        return res.status(400).json({
          success: false,
          message: 'Error processing file upload',
          error: err.message
        });
      }
      // Everything went fine
      next();
    });
  },
  addProduct
);

// Delete a product
router.delete("/:id", adminProtect, deleteProduct);

export default router;
