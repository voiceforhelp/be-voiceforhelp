const mongoose = require('mongoose');
const crypto = require('crypto');

const aiCacheSchema = new mongoose.Schema(
  {
    titleHash: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    response: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, expires: 604800 }, // TTL: 7 days
  }
);

// Static method to generate hash from title
aiCacheSchema.statics.hashTitle = function (title) {
  return crypto.createHash('md5').update(title.toLowerCase().trim()).digest('hex');
};

module.exports = mongoose.model('AICache', aiCacheSchema);
