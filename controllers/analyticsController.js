const Donation = require('../models/Donation');
const VideoImpact = require('../models/VideoImpact');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [donationStats] = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalDonations: { $sum: 1 } } },
    ]);

    const totalDonors = await Donation.distinct('phone', { paymentStatus: 'completed' });
    const totalVideos = await VideoImpact.countDocuments({ status: 'published' });
    const totalVolunteers = await Volunteer.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      success: true,
      stats: {
        totalAmount: donationStats?.totalAmount || 0,
        totalDonations: donationStats?.totalDonations || 0,
        totalDonors: totalDonors.length,
        totalVideos,
        totalVolunteers,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/analytics/daily
exports.getDailyDonations = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const daily = await Donation.aggregate([
      { $match: { paymentStatus: 'completed', donationDate: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$donationDate' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: daily.map((d) => ({ date: d._id, amount: d.amount, count: d.count })) });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/analytics/monthly
exports.getMonthlyDonations = async (req, res, next) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const monthly = await Donation.aggregate([
      { $match: { paymentStatus: 'completed', donationDate: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$donationDate' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: monthly.map((m) => ({ month: m._id, amount: m.amount, count: m.count })) });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/analytics/categories
exports.getCategoryWiseDonations = async (req, res, next) => {
  try {
    const categoryStats = await Donation.aggregate([
      { $match: { paymentStatus: 'completed', category: { $ne: null } } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          name: '$categoryInfo.name',
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, data: categoryStats });
  } catch (error) {
    next(error);
  }
};
