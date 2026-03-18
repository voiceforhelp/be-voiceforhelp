const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, lowercase: true },
    phone: { type: String, required: [true, 'Phone is required'] },
    amount: { type: Number, required: [true, 'Amount is required'], min: 1 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentMethod: { type: String, default: 'upi' },
    transactionId: { type: String },
    donationDate: { type: Date, default: Date.now },
    donationGroupDate: { type: String },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

donationSchema.index({ donationGroupDate: 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ userId: 1 });
donationSchema.index({ donationDate: -1 });

donationSchema.pre('save', function (next) {
  if (!this.donationGroupDate) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    this.donationGroupDate = `${year}-${month}-${day}`;
  }
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
