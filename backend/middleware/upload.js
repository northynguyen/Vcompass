import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 1234567890.png
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const uploadAvatar = uploadImage.fields([{ name: 'image', maxCount: 1 }]);

// Middleware xử lý lỗi upload
export const handleUploadErrors = (req, res, next) => {
  const uploadMiddleware = upload.array('images', 10); // Cho phép tối đa 10 file

  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Lỗi từ multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // Lỗi khác
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Kiểm tra xem có file nào được upload không
    if (req.files && req.files.length === 0) {
      // Không có file nào được upload, nhưng không báo lỗi
      console.log('No files uploaded, continuing...');
    }
    
    next();
  });
};

// Middleware xử lý nhiều loại file
export const handleMultipleFileTypes = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'menuImages', maxCount: 10 }
  ]);

  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Lỗi từ multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // Lỗi khác
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Kiểm tra xem có file nào được upload không
    if ((!req.files || Object.keys(req.files).length === 0) && req.body.requireFiles === 'true') {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded but files are required'
      });
    }
    
    next();
  });
};

// Make sure we're exporting upload as a named export
export { upload as default };
 

