import mongoose, { Schema } from "mongoose";

const LogActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  scheduleId: {
    type: Schema.Types.ObjectId,
    ref: 'schedule',
    required: true
  },
  actionType: {
    type: String,
    enum: ['like', 'save', 'comment', 'edit', 'view', 'share'],
    required: true
  },
  // Thời gian tương tác
  interactionTime: {
    type: Date,
    default: Date.now
  },
  // Thời gian xem (đối với view)
  viewDuration: {
    type: Number, // Thời gian xem tính bằng giây
    default: 0
  },

  content: String,

  // Các feature phái sinh
  derivedFeatures: {
    userEngagementScore: Number,
    contentPopularityScore: Number,
    seasonalityScore: Number
  }
}, {
  timestamps: true
});

// Indexes để tối ưu queries
LogActivitySchema.index({ userId: 1, scheduleId: 1 });
LogActivitySchema.index({ actionType: 1 });
LogActivitySchema.index({ interactionTime: 1 });
LogActivitySchema.index({ "scheduleMetadata.categories": 1 });
LogActivitySchema.index({ "scheduleMetadata.location": 1 });
LogActivitySchema.index({ "userMetadata.location": 1 });

// Phương thức tĩnh để tính điểm tương tác của user với schedule
LogActivitySchema.statics.calculateUserEngagement = async function (userId, scheduleId) {
  const weights = {
    view: 1,
    like: 2,
    share: 2,
    comment: 3,
    save: 4,
    edit: 5
  };

  const logs = await this.find({ userId, scheduleId });
  return logs.reduce((score, log) => score + (weights[log.actionType] || 0), 0);
};

const LogActivity = mongoose.models.LogActivity || mongoose.model("LogActivity", LogActivitySchema);

export default LogActivity;