import ShortVideo from '../models/ShortVideoModel.js';
import cloudinary from 'cloudinary';
import userModel from "../models/user.js";
import Schedule from '../models/schedule.js';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Hàm helper để xử lý lỗi
const handleError = (res, error) => {
  console.error('Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi',
    error: error.message
  });
};

// Hàm upload file lên Cloudinary
const uploadToCloudinary = (file, resourceType, folder, transformations) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra file có tồn tại không
    if (!file || !file.data) {
      return reject(new Error('File không hợp lệ hoặc rỗng'));
    }

    // Log kích thước file để debug
    console.log(`Uploading ${resourceType} file, size: ${file.data.length} bytes`);

    // Sử dụng phương thức upload thay vì upload_stream
    cloudinary.v2.uploader.upload(
      file.tempFilePath, // Sử dụng tempFilePath thay vì file.data
      {
        resource_type: resourceType,
        folder: folder,
        transformation: transformations,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// Tạo video ngắn mới với upload lên cloud
const createShortVideo = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    const { title, description, tags, category, isPublic, scheduleId } = req.body;
    const userId = req.body.userId || (req.user && req.user._id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    // Kiểm tra xem có file video được upload không
    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload video'
      });
    }

    // Kiểm tra scheduleId nếu có
    if (scheduleId) {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch trình'
        });
      }

      // Kiểm tra quyền sở hữu schedule
      if (schedule.idUser.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền liên kết video với lịch trình này'
        });
      }
    }

    const videoFile = req.files.video;
    const thumbnailFile = req.files.thumbnail || null;

    // Kiểm tra file video có hợp lệ không
    if (!videoFile.mimetype.startsWith('video/')) {
      return res.status(400).json({
        success: false,
        message: 'File không phải là video hợp lệ'
      });
    }

    // Kiểm tra file thumbnail có hợp lệ không
    if (thumbnailFile && !thumbnailFile.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'File thumbnail không phải là ảnh hợp lệ'
      });
    }

    // Tạo một Promise để xử lý việc upload và lưu video
    const processVideoPromise = (async () => {
      try {
        // Upload video lên Cloudinary
        const result = await uploadToCloudinary(
          videoFile,
          'video',
          'videos',
          [
            { width: 720, crop: 'scale' },
            { quality: 'auto:low' },
          ]
        );

        if (!result) {
          throw new Error('Lỗi khi upload video lên Cloudinary');
        }

        // Upload thumbnail lên Cloudinary nếu có
        let thumbnailUploadResult = null;
        if (thumbnailFile) {
          thumbnailUploadResult = await uploadToCloudinary(
            thumbnailFile,
            'image',
            'thumbnails',
            [{ width: 480, crop: 'scale' }]
          );
        }

        console.log('Video upload result:', result);
        console.log('Thumbnail upload result:', thumbnailUploadResult);

        // Tạo mới video ngắn
        const newShortVideo = new ShortVideo({
          userId,
          title,
          description,
          videoUrl: result.secure_url,
          thumbnailUrl: thumbnailUploadResult ? thumbnailUploadResult.secure_url : null,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          category,
          isPublic: isPublic === 'true' || isPublic === true,
          duration: result.duration || 0,
          scheduleId: scheduleId || null
        });

        await newShortVideo.save();
        console.log('Video ngắn đã được tạo thành công:', newShortVideo);

        return newShortVideo;
      } catch (error) {
        console.error('Error processing video:', error);
        throw error;
      }
    })();

    // Trả về phản hồi ngay lập tức
    res.status(201).json({
      success: true,
      message: 'Video đang được xử lý',
      processing: true
    });

    // Xử lý video trong background
    processVideoPromise
      .then(newShortVideo => {
        console.log('Video processing completed successfully');
        // Có thể gửi thông báo đến người dùng qua WebSocket hoặc Notification
      })
      .catch(error => {
        console.error('Video processing failed:', error);
        // Có thể gửi thông báo lỗi đến người dùng
      });

  } catch (error) {
    console.error('Error in createShortVideo:', error);
    handleError(res, error);
  }
};

// Lấy danh sách video ngắn
const getShortVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, userId, search } = req.query;
    const query = {};

    // Lọc theo category nếu có
    if (category && category !== 'all') {
      query.category = category;
      console.log('category:', category);
    }

    // Lọc theo userId nếu có
    if (userId) {
      query.userId = userId;
    }

    // Tìm kiếm theo title hoặc description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Chỉ lấy video công khai hoặc video của người dùng hiện tại
    if (req.user) {
      query.$or = [
        { isPublic: true },
        { userId: req.user._id }
      ];
    } else {
      query.isPublic = true;
    }

    // Đếm tổng số video thỏa mãn điều kiện
    const total = await ShortVideo.countDocuments(query);

    // Lấy danh sách video với phân trang
    const videos = await ShortVideo.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name avatar')
      .populate('scheduleId', 'scheduleName description address dateStart dateEnd')
      .populate('comments.userId', 'name avatar')
      .populate('comments.replies.userId', 'name avatar');

    res.status(200).json({
      success: true,
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Lấy chi tiết video ngắn
const getShortVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const shortVideo = await ShortVideo.findById(id)
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('comments.replies.userId', 'name avatar')
      .populate('likes', 'name avatar');

    if (!shortVideo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Kiểm tra quyền truy cập nếu video không công khai
    if (!shortVideo.isPublic && (!req.user || shortVideo.userId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem video này'
      });
    }

    // Tăng lượt xem
    await shortVideo.increaseViews();

    res.status(200).json({
      success: true,
      shortVideo
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Cập nhật video ngắn
const updateShortVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, category, isPublic, isPinned, scheduleId } = req.body;

    const shortVideo = await ShortVideo.findById(id);

    if (!shortVideo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Kiểm tra quyền cập nhật - sử dụng req.user từ auth middleware
    const userId = req.user?._id || req.body.userId;
    if (shortVideo.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật video này'
      });
    }

    // Cập nhật thông tin
    if (title !== undefined) shortVideo.title = title;
    if (description !== undefined) shortVideo.description = description;
    if (tags !== undefined) {
      shortVideo.tags = typeof tags === 'string' ?
        tags.split(',').map(tag => tag.trim()).filter(tag => tag) :
        tags;
    }
    if (category !== undefined) shortVideo.category = category;
    if (isPublic !== undefined) shortVideo.isPublic = isPublic;
    if (isPinned !== undefined) shortVideo.isPinned = isPinned;
    if (scheduleId !== undefined) shortVideo.scheduleId = scheduleId || null;

    // Xử lý thumbnail mới nếu có
    if (req.files && req.files.thumbnail) {
      // Upload thumbnail mới lên Cloudinary
      const thumbnailUploadResult = await uploadToCloudinary(
        req.files.thumbnail,
        'image',
        'thumbnails',
        [{ width: 480, crop: 'scale' }]
      );

      shortVideo.thumbnailUrl = thumbnailUploadResult.secure_url;
    }

    await shortVideo.save();

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật video thành công',
      shortVideo
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Xóa video ngắn
const deleteShortVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const shortVideo = await ShortVideo.findById(id);

    if (!shortVideo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Kiểm tra quyền xóa
    if (shortVideo.userId.toString() !== req.body.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa video này'
      });
    }

    // Xóa video và thumbnail từ Cloudinary nếu cần
    // Lưu ý: Bạn cần trích xuất public_id từ URL để xóa
    if (shortVideo.videoUrl) {
      const videoPublicId = shortVideo.videoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });
    }

    if (shortVideo.thumbnailUrl) {
      const thumbnailPublicId = shortVideo.thumbnailUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(thumbnailPublicId);
    }

    await ShortVideo.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Đã xóa video thành công'
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Thích/Bỏ thích video
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;

    const shortVideo = await ShortVideo.findById(id);

    if (!shortVideo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    await shortVideo.toggleLike(userId);

    const isLiked = shortVideo.likes.includes(userId);

    res.status(200).json({
      success: true,
      message: isLiked ? 'Đã thích video' : 'Đã bỏ thích video',
      isLiked,
      likesCount: shortVideo.likes.length
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Thêm comment vào video
const addComment = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    const { id } = req.params;
    const userId = req.body.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const video = await ShortVideo.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const newComment = {
      userId,
      text,
      likes: [],
      replies: [],
      createdAt: new Date()
    };

    video.comments.unshift(newComment); // Thêm comment mới vào đầu mảng
    await video.save();

    // Populate thông tin user cho comment mới
    const populatedVideo = await ShortVideo.findById(id)
      .populate('comments.userId', 'name avatar')
      .select('comments');

    const addedComment = populatedVideo.comments[0];

    return res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      commentId: addedComment._id,
      comment: addedComment
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Thêm reply vào comment
const addReply = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const userId = req.body.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const video = await ShortVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const comment = video.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const newReply = {
      userId,
      text,
      likes: [],
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    await video.save();

    // Populate thông tin user cho reply mới
    const populatedVideo = await ShortVideo.findById(videoId)
      .populate('comments.replies.userId', 'name avatar')
      .select('comments');

    const updatedComment = populatedVideo.comments.id(commentId);
    const addedReply = updatedComment.replies[updatedComment.replies.length - 1];

    return res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      replyId: addedReply._id,
      reply: addedReply
    });

  } catch (error) {
    console.error('Error adding reply:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Like/unlike comment
const toggleCommentLike = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const userId = req.body.userId;

    const video = await ShortVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const comment = video.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Chưa like, thêm like
      comment.likes.push(userId);
    } else {
      // Đã like, bỏ like
      comment.likes.splice(likeIndex, 1);
    }

    await video.save();

    return res.status(200).json({
      success: true,
      message: likeIndex === -1 ? 'Comment liked' : 'Comment unliked',
      likes: comment.likes
    });

  } catch (error) {
    console.error('Error liking/unliking comment:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Like/unlike reply
const toggleReplyLike = async (req, res) => {
  try {
    const { videoId, commentId, replyId } = req.params;
    const userId = req.body.userId;

    // Tìm video
    const video = await ShortVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Tìm comment trong video
    const comment = video.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Tìm reply trong comment
    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Kiểm tra xem user đã like reply chưa
    const likeIndex = reply.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Chưa like, thêm like
      reply.likes.push(userId);
    } else {
      // Đã like, bỏ like
      reply.likes.splice(likeIndex, 1);
    }

    await video.save();

    return res.status(200).json({
      success: true,
      message: likeIndex === -1 ? 'Reply liked' : 'Reply unliked',
      likes: reply.likes
    });

  } catch (error) {
    console.error('Error liking/unliking reply:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Tăng lượt chia sẻ
const increaseShares = async (req, res) => {
  try {
    const { id } = req.params;

    const shortVideo = await ShortVideo.findById(id);

    if (!shortVideo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    await shortVideo.increaseShares();

    res.status(200).json({
      success: true,
      message: 'Đã tăng lượt chia sẻ',
      sharesCount: shortVideo.shares
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Lấy video ngắn của người dùng
const getUserShortVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { userId };

    // Nếu không phải chủ tài khoản, chỉ hiển thị video công khai
    if (!req.user || req.user._id.toString() !== userId) {
      query.isPublic = true;
    }

    const total = await ShortVideo.countDocuments(query);

    const shortVideos = await ShortVideo.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name avatar');

    res.status(200).json({
      success: true,
      shortVideos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Lấy video ngắn phổ biến
const getPopularShortVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const shortVideos = await ShortVideo.find({ isPublic: true })
      .sort({ views: -1, likes: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name avatar');

    const total = await ShortVideo.countDocuments({ isPublic: true });

    res.status(200).json({
      success: true,
      shortVideos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Ghim/Bỏ ghim video
const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;

    const shortVideo = await ShortVideo.findById(id);

    if (!shortVideo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Kiểm tra quyền ghim (chỉ chủ video mới được ghim)
    if (shortVideo.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền ghim/bỏ ghim video này'
      });
    }

    shortVideo.isPinned = !shortVideo.isPinned;
    await shortVideo.save();

    res.status(200).json({
      success: true,
      message: shortVideo.isPinned ? 'Đã ghim video' : 'Đã bỏ ghim video',
      isPinned: shortVideo.isPinned
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Xóa comment
const removeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.body.userId;

    // Tìm video
    const video = await ShortVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Tìm comment
    const comment = video.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Kiểm tra quyền xóa (chỉ người tạo comment hoặc chủ video mới được xóa)
    if (comment.userId.toString() !== userId && video.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }

    // Xóa comment
    comment.remove();
    await video.save();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error removing comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa reply
const removeReply = async (req, res) => {
  try {
    const { videoId, commentId, replyId } = req.params;
    const userId = req.body.userId;

    // Tìm video
    const video = await ShortVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Tìm comment
    const comment = video.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Tìm reply
    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Kiểm tra quyền xóa (chỉ người tạo reply, người tạo comment hoặc chủ video mới được xóa)
    if (reply.userId.toString() !== userId &&
      comment.userId.toString() !== userId &&
      video.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this reply'
      });
    }

    // Xóa reply
    reply.remove();
    await video.save();

    return res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });

  } catch (error) {
    console.error('Error removing reply:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Tăng lượt xem cho video
const increaseViews = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm video
    const video = await ShortVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Tăng lượt xem
    video.views += 1;
    await video.save();

    return res.status(200).json({
      success: true,
      message: 'View count increased successfully',
      views: video.views
    });

  } catch (error) {
    console.error('Error increasing view count:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy video ngắn theo xu hướng
const getTrendingVideos = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    // Xây dựng query cơ bản
    let query = { isPublic: true };

    // Thêm điều kiện category nếu có
    if (category && category !== 'all') {
      query.category = category;
    }

    // Lấy tất cả video mà không sắp xếp trước
    const videos = await ShortVideo.find(query)
      .populate('userId', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.userId', 'name avatar');

    // Tính điểm tương tác cho mỗi video
    const scoredVideos = videos.map(video => {
      const now = new Date();
      const videoAge = (now - video.createdAt) / (1000 * 60 * 60); // Tuổi video tính bằng giờ

      // Tính điểm tương tác
      const engagementScore = (
        (video.likes.length * 2) + // Mỗi like = 2 điểm
        (video.comments.length * 3) + // Mỗi comment = 3 điểm
        (video.views * 0.1) + // Mỗi view = 0.1 điểm
        (video.shares * 4) // Mỗi share = 4 điểm
      );

      // Giảm điểm theo thời gian (video càng cũ điểm càng thấp)
      const timeDecay = Math.exp(-videoAge / 24); // Giảm 50% mỗi 24 giờ

      // Tính điểm cuối cùng
      const finalScore = engagementScore * timeDecay;

      return {
        ...video.toObject(),
        score: finalScore
      };
    });

    // Sắp xếp theo điểm từ cao đến thấp
    scoredVideos.sort((a, b) => b.score - a.score);

    // Phân trang
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVideos = scoredVideos.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      videos: paginatedVideos,
      total: scoredVideos.length,
      totalPages: Math.ceil(scoredVideos.length / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting trending videos:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy video theo xu hướng'
    });
  }
};

const getFollowingVideos = async (req, res) => {
  try {
    const userId = req.body.userId;

    // Lấy danh sách người dùng đang follow
    const user = await userModel.findById(userId).select('following');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Lấy tất cả video của những người đang follow
    const followingVideos = await ShortVideo.find({
      userId: { $in: user.following },
      isPublic: true
    })
      .populate('userId', 'name avatar verified')
      .populate('scheduleId', 'scheduleName description address dateStart dateEnd')
      .sort({ createdAt: -1 });

    // Tính điểm tương tác cho mỗi video
    const videosWithScore = followingVideos.map(video => {
      // Tính điểm dựa trên các yếu tố tương tác
      const likesScore = video.likes.length * 2;
      const commentsScore = video.comments.length * 1.5;
      const viewsScore = video.views * 0.1;
      const sharesScore = video.shares * 2;

      // Tính thời gian decay (video cũ hơn sẽ có điểm thấp hơn)
      const hoursSinceCreation = (Date.now() - video.createdAt) / (1000 * 60 * 60);
      const timeDecay = Math.exp(-hoursSinceCreation / 24); // Decay trong 24 giờ

      // Tính tổng điểm
      const totalScore = (likesScore + commentsScore + viewsScore + sharesScore) * timeDecay;

      return {
        ...video.toObject(),
        interactionScore: totalScore
      };
    });

    // Sắp xếp video theo điểm tương tác
    const sortedVideos = videosWithScore.sort((a, b) => b.interactionScore - a.interactionScore);

    res.status(200).json({
      success: true,
      videos: sortedVideos
    });
  } catch (error) {
    console.error('Error getting following videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting following videos'
    });
  }
};

// Meta tags for social sharing
const getShortVideoMetaTags = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await ShortVideo.findById(id).populate('userId', 'name avatar').lean();

    if (!video) {
      return res.status(404).send("Video not found");
    }

    // Get video thumbnail or video URL for preview
    let imageUrl = video.thumbnailUrl || video.videoUrl || 'https://res.cloudinary.com/dmdzku5og/image/upload/v1753888598/du-lich-viet-nam_a5b5777f771c44a89aee7f59151e7f95_xh9zbs.jpg';

    const description = video.description || `Xem video ngắn từ ${video.userId?.name || 'VCompass User'}`;
    const title = video.title || `Video ngắn - ${video.userId?.name || 'VCompass'}`;
    const url = `https://vcompass.onrender.com/short-video?videoId=${id}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="video.other">
    <meta property="og:site_name" content="VCompass">
    <meta property="og:video" content="${video.videoUrl}">
    <meta property="og:video:type" content="video/mp4">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="player">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:player" content="${video.videoUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="author" content="${video.userId?.name || 'VCompass User'}">
    <meta name="keywords" content="video ngắn, ${video.category || ''}, ${video.tags?.join(', ') || ''}, VCompass">
    
    <script>
        // Redirect to main app after 1 second
        setTimeout(function() {
            window.location.href = "${url}";
        }, 1000);
    </script>
    
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #000;
            color: white;
        }
        .loading-container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        a {
            color: #ff6b6b;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="loading-container">
        <div class="spinner"></div>
        <h2>Đang chuyển hướng đến video...</h2>
        <p>${title}</p>
        <p>Nếu không tự động chuyển hướng, <a href="${url}">nhấn vào đây</a></p>
    </div>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error("Error serving video meta tags:", error);
    res.status(500).send("Error loading video");
  }
};

export {
  createShortVideo,
  getShortVideos,
  getShortVideoById,
  updateShortVideo,
  deleteShortVideo,
  toggleLike,
  addComment,
  removeComment,
  addReply,
  removeReply,
  toggleCommentLike,
  toggleReplyLike,
  increaseViews,
  increaseShares,
  getUserShortVideos,
  getPopularShortVideos,
  togglePin,
  getTrendingVideos,
  getFollowingVideos,
  getShortVideoMetaTags
};
