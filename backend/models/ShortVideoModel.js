import mongoose from 'mongoose';

// Schema cho reply
const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schema cho comment
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ShortVideoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'general'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Tạo index để tìm kiếm nhanh hơn
ShortVideoSchema.index({ userId: 1 });
ShortVideoSchema.index({ tags: 1 });
ShortVideoSchema.index({ category: 1 });
ShortVideoSchema.index({ createdAt: -1 });
ShortVideoSchema.index({ views: -1 });

// Phương thức tăng lượt xem
ShortVideoSchema.methods.increaseViews = function() {
  this.views += 1;
  return this.save();
};

// Phương thức thêm/xóa like
ShortVideoSchema.methods.toggleLike = function(userId) {
  const userIdStr = userId.toString();
  const index = this.likes.findIndex(id => id.toString() === userIdStr);
  
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  
  return this.save();
};

// Phương thức thêm comment
ShortVideoSchema.methods.addComment = function(userId, text) {
  this.comments.push({ userId, text });
  return this.save();
};

// Phương thức xóa comment
ShortVideoSchema.methods.removeComment = function(commentId) {
  const index = this.comments.findIndex(comment => comment._id.toString() === commentId);
  
  if (index !== -1) {
    this.comments.splice(index, 1);
    return this.save();
  }
  
  return Promise.reject(new Error('Comment not found'));
};

// Phương thức tăng lượt share
ShortVideoSchema.methods.increaseShares = function() {
  this.shares += 1;
  return this.save();
};

const ShortVideo = mongoose.models.ShortVideoSchema || mongoose.model('ShortVideo', ShortVideoSchema);
export default ShortVideo;