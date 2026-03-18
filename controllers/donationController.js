const Donation = require('../models/Donation');
const Category = require('../models/Category');
const User = require('../models/User');
const ApiFeatures = require('../utils/apiFeatures');
const { generateUPIQRData } = require('../services/paymentService');
const { getDonationGroupDate } = require('../utils/helpers');
const { sendDonationConfirmationEmail, sendDonationStatusEmail } = require('../services/emailService');

// @route   POST /api/donations
exports.createDonation = async (req, res, next) => {
  try {
    const { name, email, phone, amount, category, isVolunteer } = req.body;

    const donation = await Donation.create({
      userId: req.user ? req.user._id : null,
      name,
      email,
      phone,
      amount,
      category,
      donationGroupDate: getDonationGroupDate(),
      paymentStatus: 'pending',
    });

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $push: { donations: donation._id } });
    }

    const qrData = generateUPIQRData(amount, donation._id.toString());

    // Send donation confirmation email (non-blocking)
    sendDonationConfirmationEmail(donation).catch((err) => console.error('Donation email error:', err));

    res.status(201).json({ success: true, donation, payment: qrData });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/donations/fast
exports.createFastDonation = async (req, res, next) => {
  try {
    const { phone, amount, category } = req.body;

    const donation = await Donation.create({
      name: 'Anonymous',
      phone,
      amount,
      category: category || null,
      donationGroupDate: getDonationGroupDate(),
      isAnonymous: true,
      paymentStatus: 'pending',
    });

    const qrData = generateUPIQRData(amount, donation._id.toString());

    res.status(201).json({ success: true, donation, payment: qrData });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations (admin)
exports.getDonations = async (req, res, next) => {
  try {
    const total = await Donation.countDocuments();
    const features = new ApiFeatures(Donation.find().populate('category', 'name'), req.query)
      .filter()
      .search('name')
      .sort()
      .paginate();

    const donations = await features.query;

    res.json({
      success: true,
      count: donations.length,
      total,
      page: features.page,
      pages: Math.ceil(total / features.limit),
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/group/:date (admin)
exports.getDonationsByGroupDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const donations = await Donation.find({
      donationGroupDate: date,
      paymentStatus: 'completed',
    })
      .populate('category', 'name')
      .sort('-amount');

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({ success: true, date, count: donations.length, totalAmount, donations });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/my
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ userId: req.user._id })
      .populate('category', 'name')
      .sort('-donationDate');

    res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/stats (admin)
exports.getDonationStats = async (req, res, next) => {
  try {
    const totalStats = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          avgDonation: { $avg: '$amount' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: totalStats[0] || { totalAmount: 0, totalDonations: 0, avgDonation: 0 },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/recent
exports.getRecentDonors = async (req, res, next) => {
  try {
    const donors = await Donation.find({ paymentStatus: 'completed' })
      .select('name amount category donationDate avatar')
      .populate('category', 'name')
      .sort('-donationDate')
      .limit(10);

    res.json({ success: true, donors });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/donations/:id/status (admin)
exports.updateDonationStatus = async (req, res, next) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.paymentStatus = paymentStatus;
    if (transactionId) donation.transactionId = transactionId;
    await donation.save();

    if (paymentStatus === 'completed' && donation.category) {
      await Category.findByIdAndUpdate(donation.category, { $inc: { raisedAmount: donation.amount } });
    }

    // Send donation status email (non-blocking)
    sendDonationStatusEmail(donation, paymentStatus).catch((err) => console.error('Status email error:', err));

    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};
