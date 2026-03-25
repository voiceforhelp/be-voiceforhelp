const mongoose = require('mongoose');

const videoCommentSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoImpact', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: [true, 'Comment text is required'], trim: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

videoCommentSchema.index({ video: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('VideoComment', videoCommentSchema);
