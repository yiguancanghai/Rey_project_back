/**
 * File upload utility using multer
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BadRequestError } = require('./error.util');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new BadRequestError('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

/**
 * Delete a file from the uploads directory
 * @param {string} filename - Name of file to delete
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const deleteFile = async (filename) => {
  if (!filename) return false;
  
  const filePath = path.join(uploadDir, filename);
  
  try {
    // Check if file exists
    await fs.promises.access(filePath, fs.constants.F_OK);
    
    // Delete the file
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
    return false;
  }
};

module.exports = {
  upload,
  deleteFile,
  uploadDir
};

/**
 * Get file URL from filename
 * @param {string} filename - Uploaded filename
 * @returns {string} File URL path
 */
exports.getFileUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/${filename}`;
}; 