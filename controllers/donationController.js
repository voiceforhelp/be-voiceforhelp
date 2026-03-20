const Donation = require('../models/Donation');
const Category = require('../models/Category');
const User = require('../models/User');
const ApiFeatures = require('../utils/apiFeatures');
const { generateUPIQRData, initiatePhonePePayment, checkPhonePeStatus, isPhonePeConfigured } = require('../services/paymentService');
const { getDonationGroupDate } = require('../utils/helpers');
const { sendDonationConfirmationEmail, sendDonationStatusEmail } = require('../services/emailService');

// Helper: Try to link donation to existing user by email
async function linkDonationToUser(donation, email) {
  if (!email) return;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      donation.userId = user._id;
      await donation.save();
      await User.findByIdAndUpdate(user._id, { $addToSet: { donations: donation._id } });
    }
  } catch (err) {
    console.error('Error linking donation to user:', err.message);
  }
}

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
      category: category || null,
      donationGroupDate: getDonationGroupDate(),
      paymentStatus: 'pending',
      paymentMethod: isPhonePeConfigured() ? 'phonepe' : 'upi',
    });

    if (req.user) {
      // Logged in user - link directly
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { donations: donation._id } });
    } else if (email) {
      // Not logged in - try to link by email
      await linkDonationToUser(donation, email);
    }

    // Send donation confirmation email (non-blocking)
    sendDonationConfirmationEmail(donation).catch((err) => console.error('Donation email error:', err));

    // Try PhonePe first, fallback to UPI QR
    if (isPhonePeConfigured()) {
      try {
        const phonePeResult = await initiatePhonePePayment(
          amount,
          donation._id.toString(),
          name,
          phone
        );
        return res.status(201).json({
          success: true,
          donation,
          paymentMethod: 'phonepe',
          paymentUrl: phonePeResult.paymentUrl,
        });
      } catch (phonePeError) {
        console.error('PhonePe initiation failed, falling back to UPI:', phonePeError.message);
      }
    }

    // Fallback: UPI QR
    const qrData = generateUPIQRData(amount, donation._id.toString());
    res.status(201).json({ success: true, donation, paymentMethod: 'upi', payment: qrData });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/donations/fast
exports.createFastDonation = async (req, res, next) => {
  try {
    const { phone, amount, category, email } = req.body;

    const donation = await Donation.create({
      name: email ? 'Donor' : 'Anonymous',
      email: email || null,
      phone,
      amount,
      category: category || null,
      donationGroupDate: getDonationGroupDate(),
      isAnonymous: !email,
      paymentStatus: 'pending',
      paymentMethod: isPhonePeConfigured() ? 'phonepe' : 'upi',
    });

    // Try to link by email if provided
    if (email) {
      await linkDonationToUser(donation, email);
    }

    // Try PhonePe first
    if (isPhonePeConfigured()) {
      try {
        const phonePeResult = await initiatePhonePePayment(
          amount,
          donation._id.toString(),
          donation.name,
          phone
        );
        return res.status(201).json({
          success: true,
          donation,
          paymentMethod: 'phonepe',
          paymentUrl: phonePeResult.paymentUrl,
        });
      } catch (phonePeError) {
        console.error('PhonePe initiation failed, falling back to UPI:', phonePeError.message);
      }
    }

    // Fallback: UPI QR
    const qrData = generateUPIQRData(amount, donation._id.toString());
    res.status(201).json({ success: true, donation, paymentMethod: 'upi', payment: qrData });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/donations/phonepe/callback (PhonePe server-to-server)
exports.phonePeCallback = async (req, res, next) => {
  try {
    const { response: base64Response } = req.body;

    if (!base64Response) {
      return res.status(400).json({ success: false, message: 'Invalid callback data' });
    }

    const decodedResponse = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
    const { merchantTransactionId, code, transactionId } = decodedResponse.data || {};

    if (!merchantTransactionId) {
      return res.status(400).json({ success: false, message: 'Missing transaction ID' });
    }

    const donation = await Donation.findById(merchantTransactionId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.paymentStatus !== 'pending') {
      return res.json({ success: true, message: 'Already processed' });
    }

    const isSuccess = code === 'PAYMENT_SUCCESS';
    donation.paymentStatus = isSuccess ? 'completed' : 'failed';
    if (transactionId) donation.transactionId = transactionId;
    await donation.save();

    if (isSuccess && donation.category) {
      await Category.findByIdAndUpdate(donation.category, { $inc: { raisedAmount: donation.amount } });
    }

    sendDonationStatusEmail(donation, donation.paymentStatus).catch((err) =>
      console.error('Status email error:', err)
    );

    res.json({ success: true });
  } catch (error) {
    console.error('PhonePe callback error:', error);
    res.status(500).json({ success: false, message: 'Callback processing failed' });
  }
};

// @route   GET /api/donations/phonepe/status/:txnId
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { txnId } = req.params;

    const donation = await Donation.findById(txnId).populate('category', 'name');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // If still pending and PhonePe, check with PhonePe API
    if (donation.paymentStatus === 'pending' && donation.paymentMethod === 'phonepe' && isPhonePeConfigured()) {
      try {
        const statusResponse = await checkPhonePeStatus(txnId);
        const code = statusResponse?.code;
        const phonePeTxnId = statusResponse?.data?.transactionId;

        if (code === 'PAYMENT_SUCCESS') {
          donation.paymentStatus = 'completed';
          if (phonePeTxnId) donation.transactionId = phonePeTxnId;
          await donation.save();

          if (donation.category) {
            await Category.findByIdAndUpdate(donation.category, { $inc: { raisedAmount: donation.amount } });
          }
          sendDonationStatusEmail(donation, 'completed').catch((err) => console.error('Status email error:', err));
        } else if (code === 'PAYMENT_ERROR' || code === 'PAYMENT_DECLINED') {
          donation.paymentStatus = 'failed';
          await donation.save();
          sendDonationStatusEmail(donation, 'failed').catch((err) => console.error('Status email error:', err));
        }
      } catch (statusError) {
        console.error('PhonePe status check error:', statusError.message);
      }
    }

    res.json({
      success: true,
      donation: {
        _id: donation._id,
        name: donation.name,
        email: donation.email,
        amount: donation.amount,
        paymentStatus: donation.paymentStatus,
        transactionId: donation.transactionId,
        category: donation.category,
        donationDate: donation.donationDate,
        paymentMethod: donation.paymentMethod,
        userId: donation.userId,
      },
    });
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
    // Find by userId OR by email (to include donations made before registration)
    const donations = await Donation.find({
      $or: [
        { userId: req.user._id },
        { email: req.user.email },
      ],
    })
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

    sendDonationStatusEmail(donation, paymentStatus).catch((err) => console.error('Status email error:', err));

    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};
