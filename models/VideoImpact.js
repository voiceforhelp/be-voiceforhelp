const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
  },
  { _id: false }
);

const videoImpactSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: [true, 'Video URL is required'] },
    thumbnailUrl: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    donorGroupDate: { type: String, required: [true, 'Donor group date is required'] },
    linkedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
    tags: [{ type: String }],
    socialLinks: {
      instagram: [socialLinkSchema],
      youtube: [socialLinkSchema],
      facebook: [socialLinkSchema],
    },
    status: { type: String, enum: ['processing', 'published', 'failed'], default: 'processing' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoImpactSchema.index({ donorGroupDate: 1 });
videoImpactSchema.index({ status: 1 });
videoImpactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VideoImpact', videoImpactSchema);
