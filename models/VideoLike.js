const mongoose = require('mongoose');

const videoLikeSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoImpact', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// One like per user per video
videoLikeSchema.index({ video: 1, user: 1 }, { unique: true });
videoLikeSchema.index({ video: 1 });

module.exports = mongoose.model('VideoLike', videoLikeSchema);
