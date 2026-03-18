const VideoImpact = require('../models/VideoImpact');
const Donation = require('../models/Donation');
const { triggerN8nWorkflow } = require('../services/n8nService');
const { sendVideoNotificationEmail } = require('../services/emailService');
const ApiFeatures = require('../utils/apiFeatures');

// @route   POST /api/videos (admin)
exports.uploadVideo = async (req, res, next) => {
  try {
    const { title, description, category, donorGroupDate, videoUrl, thumbnailUrl } = req.body;

    const video = await VideoImpact.create({
      title,
      description,
      category,
      donorGroupDate,
      videoUrl: req.file ? req.file.path : videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      status: 'published',
    });

    await video.populate('category', 'name');

    // Trigger n8n automation for social media posting
    triggerN8nWorkflow(video).catch((err) => console.error('N8N trigger error:', err));

    // Notify donors of this group date via email (non-blocking)
    (async () => {
      try {
        const donors = await Donation.find({
          donationGroupDate: donorGroupDate,
          paymentStatus: 'completed',
          email: { $exists: true, $ne: '' },
        }).select('email name');

        // Deduplicate by email
        const seen = new Set();
        for (const donor of donors) {
          if (donor.email && !seen.has(donor.email)) {
            seen.add(donor.email);
            sendVideoNotificationEmail(donor.email, donor.name, video).catch((err) =>
              console.error(`Video notification email error for ${donor.email}:`, err)
            );
          }
        }
      } catch (err) {
        console.error('Video notification batch error:', err);
      }
    })();

    res.status(201).json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/videos (public - latest 7 days)
exports.getVideos = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const filter = { status: 'published' };
    if (!req.query.all) {
      filter.createdAt = { $gte: sevenDaysAgo };
    }

    const total = await VideoImpact.countDocuments(filter);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const videos = await VideoImpact.find(filter)
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: videos.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      videos,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/videos/:id
exports.getVideoById = async (req, res, next) => {
  try {
    const video = await VideoImpact.findById(req.params.id).populate('category', 'name');
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    video.views += 1;
    await video.save();
    res.json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/videos/group/:date
exports.getVideosByDonorGroup = async (req, res, next) => {
  try {
    const videos = await VideoImpact.find({
      donorGroupDate: req.params.date,
      status: 'published',
    }).populate('category', 'name');

    res.json({ success: true, count: videos.length, videos });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/videos/my
exports.getMyVideos = async (req, res, next) => {
  try {
    const Donation = require('../models/Donation');
    const userDonations = await Donation.find({
      userId: req.user._id,
      paymentStatus: 'completed',
    }).distinct('donationGroupDate');

    const videos = await VideoImpact.find({
      donorGroupDate: { $in: userDonations },
      status: 'published',
    })
      .populate('category', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: videos.length, videos });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/videos/:id (admin)
exports.updateVideo = async (req, res, next) => {
  try {
    const video = await VideoImpact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/videos/:id (admin)
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await VideoImpact.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    next(error);
  }
};
