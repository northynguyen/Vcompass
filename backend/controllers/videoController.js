import cloudinary from 'cloudinary';
import multer from 'multer';
import axios from 'axios';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

const uploadToCloudinary = (buffer, resourceType, folder, transformations) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: folder,
        transformation: transformations,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'video', 'videos', [
      { width: 720, crop: 'scale' },  
      { quality: 'auto:low' },       
    ]);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading video:', error);

    if (error.message === 'Invalid file type. Only video files are allowed.') {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Error uploading video', error: error.message });
    }
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'image', 'images', [
      { width: 800, crop: 'scale' },
      { quality: 'auto' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading image:', error);

    if (error.message === 'Invalid file type. Only images are allowed.') {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Error uploading image', error: error.message });
    }
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { videoPath } = req.body;

    if (!videoPath) {
      return res.status(400).json({ success: false, message: 'public_id is required' });
    }

    cloudinary.v2.uploader.destroy(videoPath, { resource_type: 'video' }, (error, result) => {
      if (error) {
        console.error('Error deleting video:', error);
        return res.status(500).json({ success: false, message: 'Error deleting video', error: error.message });
      }

      res.status(200).json({
        success: true,
        message: 'Video deleted successfully',
        result,
      });
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, message: 'Error deleting video', error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({ success: false, message: 'public_id is required' });
    }

    cloudinary.v2.uploader.destroy(imagePath, { resource_type: 'image' }, (error, result) => {
      if (error) {
        console.error('Error deleting image:', error);
        return res.status(500).json({ success: false, message: 'Error deleting image', error: error.message });
      }

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        result,
      });
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image', error: error.message });
  }
};

 const uploadToCloudinaryV2 = (buffer, folder, transformations) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: transformations,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

export { upload, uploadVideo, uploadImage, deleteVideo, deleteImage, uploadToCloudinaryV2 };
