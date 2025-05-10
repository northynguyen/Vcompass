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

    const result = await deleteImageFromCloudinary(imagePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      result,
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image', error: error.message });
  }
};

const deleteImageFromCloudinary = async (imagePath) => {
  return new Promise((resolve, reject) => {
    if (!imagePath) {
      return reject(new Error('imagePath is required'));
    }

    console.log(`Attempting to delete image: ${imagePath}`);
    
    cloudinary.v2.uploader.destroy(imagePath, { resource_type: 'image' }, (error, result) => {
      if (error) {
        console.error(`Error deleting image from Cloudinary: ${imagePath}`, error);
        reject(error);
      } else {
        console.log(`Successfully deleted image from Cloudinary: ${imagePath}`, result);
        resolve(result);
      }
    });
  });
};

const uploadToCloudinaryV2 = async (buffer, folder = 'images', transformations = []) => {
  try {
    // Check if buffer is valid
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty file buffer');
    }
    
    console.log(`Buffer received: ${buffer.length} bytes`);
    
    // Convert buffer to base64
    const b64 = Buffer.from(buffer).toString('base64');
    console.log(`Base64 length: ${b64.length} characters`);
    
    const dataURI = `data:image/jpeg;base64,${b64}`;
    
    // Set up transformation options
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto'
    };
    
    if (transformations && transformations.length > 0) {
      uploadOptions.transformation = transformations;
    }
    
    console.log(`Uploading to Cloudinary folder: ${folder} with options:`, uploadOptions);
    
    // Upload to Cloudinary
    try {
      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
      console.log("Cloudinary upload successful:", {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes
      });
      return result;
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      throw cloudinaryError;
    }
  } catch (error) {
    console.error('Error in uploadToCloudinaryV2:', error);
    throw error;
  }
};

const copyMediaFromSchedule = async (oldSchedule) => {
  try {
    const copiedMedia = {
      imgSrc: [],
      videoSrc: null
    };

    // Copy main schedule images
    if (oldSchedule.imgSrc && oldSchedule.imgSrc.length > 0) {
      for (const imgUrl of oldSchedule.imgSrc) {
        if (imgUrl) {
          try {
            // Check if URL is valid
            if (!imgUrl.startsWith('http') && !imgUrl.startsWith('https')) {
              // If it's a default image or local path, just keep it as is
              copiedMedia.imgSrc.push(imgUrl);
              continue;
            }

            // Download image from old URL
            const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            
            // Upload to Cloudinary
            const result = await uploadToCloudinary(buffer, 'image', 'images', [
              { width: 800, crop: 'scale' },
              { quality: 'auto' },
            ]);
            
            copiedMedia.imgSrc.push(result.secure_url);
          } catch (error) {
            console.error(`Error copying image ${imgUrl}:`, error);
            // If there's an error, keep the original URL
            copiedMedia.imgSrc.push(imgUrl);
          }
        }
      }
    }

    // Copy main schedule video
    if (oldSchedule.videoSrc) {
      try {
        // Check if URL is valid
        if (!oldSchedule.videoSrc.startsWith('http') && !oldSchedule.videoSrc.startsWith('https')) {
          // If it's a default video or local path, just keep it as is
          copiedMedia.videoSrc = oldSchedule.videoSrc;
        } else {
          const response = await axios.get(oldSchedule.videoSrc, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data, 'binary');
          
          const result = await uploadToCloudinary(buffer, 'video', 'videos', [
            { width: 720, crop: 'scale' },
            { quality: 'auto:low' },
          ]);
          
          copiedMedia.videoSrc = result.secure_url;
        }
      } catch (error) {
        console.error(`Error copying video ${oldSchedule.videoSrc}:`, error);
        // If there's an error, keep the original URL
        copiedMedia.videoSrc = oldSchedule.videoSrc;
      }
    }

    // Copy images from activities
    if (oldSchedule.activities) {
      for (const day of oldSchedule.activities) {
        for (const activity of day.activity) {
          if (activity.imgSrc && activity.imgSrc.length > 0) {
            const copiedActivityImages = [];
            for (const imgUrl of activity.imgSrc) {
              if (imgUrl) {
                try {
                  // Check if URL is valid
                  if (!imgUrl.startsWith('http') && !imgUrl.startsWith('https')) {
                    // If it's a default image or local path, just keep it as is
                    copiedActivityImages.push(imgUrl);
                    continue;
                  }

                  const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
                  const buffer = Buffer.from(response.data, 'binary');
                  
                  const result = await uploadToCloudinary(buffer, 'image', 'images', [
                    { width: 800, crop: 'scale' },
                    { quality: 'auto' },
                  ]);
                  
                  copiedActivityImages.push(result.secure_url);
                } catch (error) {
                  console.error(`Error copying activity image ${imgUrl}:`, error);
                  // If there's an error, keep the original URL
                  copiedActivityImages.push(imgUrl);
                }
              }
            }
            activity.imgSrc = copiedActivityImages;
          }
        }
      }
    }

    return {
      ...copiedMedia,
      activities: oldSchedule.activities
    };
  } catch (error) {
    console.error('Error copying media:', error);
    throw error;
  }
};

export { upload, uploadVideo, uploadImage, deleteVideo, deleteImage, uploadToCloudinaryV2, deleteImageFromCloudinary, copyMediaFromSchedule };
