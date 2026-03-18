const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'reset-password'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete

module.exports = mongoose.model('OTP', otpSchema);
