import cloudinary from 'cloudinary';
import multer from 'multer';
import axios from 'axios';
// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// console.log("Cloudinary configuration:");
// console.log(cloudinary.config());

// const testConnection = async () => {
//     try {
//       const response = await axios.get(`https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/resources`, {
//         auth: {
//           username: cloudinary.config().api_key,
//           password: cloudinary.config().api_secret,
//         },
//       });
//       console.log("Connected to Cloudinary! Resources:", response.data);
//     } catch (error) {
//       console.error("Error connecting to Cloudinary:", error.message);
//     }
//   };
  
//   testConnection();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'videos',
        transformation: [
          { width: 720, crop: 'scale' },  
          { quality: 'auto:low' },       
        ],
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

    const result = await uploadToCloudinary(req.file.buffer);

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

 const deleteVideo = async (req, res) => {
    try {
      const { videoPath  } = req.body;
  
      if (!videoPath) {
        return res.status(400).json({ success: false, message: 'public_id is required' });
      }
  
      // Gọi API Cloudinary để xóa video
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

export {upload, uploadVideo, deleteVideo };
