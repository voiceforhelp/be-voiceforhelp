const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], lowercase: true },
    phone: { type: String, required: [true, 'Phone is required'] },
    availabilityType: {
      type: String,
      enum: ['weekends', 'alternate_days', 'festivals', 'specific_dates'],
      required: true,
    },
    date: { type: Date },
    time: { type: String },
    location: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
