const VideoImpact = require('../models/VideoImpact');
const Donation = require('../models/Donation');
const { triggerN8nWorkflow } = require('../services/n8nService');
const { sendVideoNotificationEmail, sendDonorLinkedVideoEmail } = require('../services/emailService');
const ApiFeatures = require('../utils/apiFeatures');

// @route   POST /api/videos (admin)
exports.uploadVideo = async (req, res, next) => {
  try {
    const { title, description, category, donorGroupDate, videoUrl, thumbnailUrl, linkedDonors, tags, socialLinks } = req.body;

    // Parse linkedDonors and tags if sent as strings (from FormData)
    let parsedLinkedDonors = linkedDonors;
    if (typeof linkedDonors === 'string') {
      try { parsedLinkedDonors = JSON.parse(linkedDonors); } catch { parsedLinkedDonors = []; }
    }

    let parsedTags = tags;
    if (typeof tags === 'string') {
      try { parsedTags = JSON.parse(tags); } catch { parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean); }
    }

    let parsedSocialLinks = socialLinks;
    if (typeof socialLinks === 'string') {
      try { parsedSocialLinks = JSON.parse(socialLinks); } catch { parsedSocialLinks = {}; }
    }

    const video = await VideoImpact.create({
      title,
      description,
      category: category || undefined,
      donorGroupDate,
      videoUrl: req.file ? req.file.path : videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      linkedDonors: parsedLinkedDonors || [],
      tags: parsedTags || [],
      socialLinks: parsedSocialLinks || {},
      status: 'published',
    });

    await video.populate('category', 'name');

    // Trigger n8n automation
    triggerN8nWorkflow(video).catch((err) => console.error('N8N trigger error:', err));

    // Send emails to linked donors (non-blocking)
    (async () => {
      try {
        const seen = new Set();

        // 1. Email linked donors with personalized info
        if (parsedLinkedDonors && parsedLinkedDonors.length > 0) {
          const donations = await Donation.find({
            _id: { $in: parsedLinkedDonors },
            email: { $exists: true, $ne: '' },
          }).populate('category', 'name');

          for (const donation of donations) {
            if (donation.email && !seen.has(donation.email)) {
              seen.add(donation.email);
              sendDonorLinkedVideoEmail(donation, video).catch((err) =>
                console.error(`Donor linked video email error for ${donation.email}:`, err)
              );
            }
          }
        }

        // 2. Also notify remaining donors of that group date (legacy behavior)
        const groupDonors = await Donation.find({
          donationGroupDate: donorGroupDate,
          paymentStatus: 'completed',
          email: { $exists: true, $ne: '' },
        }).select('email name');

        for (const donor of groupDonors) {
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
    const video = await VideoImpact.findById(req.params.id)
      .populate('category', 'name')
      .populate({
        path: 'linkedDonors',
        select: 'name email amount category donationDate isAnonymous',
        populate: { path: 'category', select: 'name' },
      });

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
    const userDonations = await Donation.find({
      userId: req.user._id,
      paymentStatus: 'completed',
    });

    const donationIds = userDonations.map(d => d._id);
    const groupDates = [...new Set(userDonations.map(d => d.donationGroupDate))];

    // Find videos where user is linked directly OR by group date
    const videos = await VideoImpact.find({
      status: 'published',
      $or: [
        { linkedDonors: { $in: donationIds } },
        { donorGroupDate: { $in: groupDates } },
      ],
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
    const { linkedDonors, tags, socialLinks, ...rest } = req.body;

    const updateData = { ...rest };

    if (linkedDonors !== undefined) updateData.linkedDonors = linkedDonors;
    if (tags !== undefined) updateData.tags = tags;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    const video = await VideoImpact.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name')
      .populate({
        path: 'linkedDonors',
        select: 'name email amount category',
        populate: { path: 'category', select: 'name' },
      });

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
