const VideoLike = require('../models/VideoLike');
const VideoComment = require('../models/VideoComment');
const VideoImpact = require('../models/VideoImpact');

// ═══════════════════ LIKES ═══════════════════

// @route   POST /api/videos/:id/like (authenticated)
exports.toggleLike = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    const existing = await VideoLike.findOne({ video: videoId, user: userId });

    if (existing) {
      // Unlike
      await VideoLike.deleteOne({ _id: existing._id });
      await VideoImpact.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });
      return res.json({ success: true, liked: false });
    }

    // Like
    await VideoLike.create({ video: videoId, user: userId });
    await VideoImpact.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });
    res.status(201).json({ success: true, liked: true });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/videos/:id/like-status (authenticated)
exports.getLikeStatus = async (req, res, next) => {
  try {
    const existing = await VideoLike.findOne({ video: req.params.id, user: req.user._id });
    res.json({ success: true, liked: !!existing });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════ COMMENTS ═══════════════════

// @route   GET /api/videos/:id/comments (public - only approved)
exports.getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const videoId = req.params.id;

    // Only show approved comments to public
    const filter = { video: videoId, status: 'approved' };

    const [comments, total] = await Promise.all([
      VideoComment.find(filter)
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      VideoComment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      comments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/videos/:id/comments (authenticated)
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    // Admin comments are auto-approved, user comments need admin approval
    const isAdmin = req.user.role === 'admin';

    const comment = await VideoComment.create({
      video: req.params.id,
      user: req.user._id,
      text: text.trim(),
      status: isAdmin ? 'approved' : 'pending',
    });

    // Only increment commentsCount for approved comments
    if (isAdmin) {
      await VideoImpact.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    }

    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/videos/:id/comments/:commentId (authenticated - own comment or admin)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await VideoComment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Only comment owner or admin can delete
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    const wasApproved = comment.status === 'approved';
    await VideoComment.deleteOne({ _id: comment._id });

    // Only decrement count if comment was approved (visible)
    if (wasApproved) {
      await VideoImpact.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: -1 } });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════ ADMIN MANAGEMENT ═══════════════════

// @route   GET /api/videos/admin/comments (admin - all comments with filters)
exports.adminGetComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { status, videoId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (videoId) filter.video = videoId;

    const [comments, total] = await Promise.all([
      VideoComment.find(filter)
        .populate('user', 'name email avatar')
        .populate('video', 'title thumbnailUrl')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      VideoComment.countDocuments(filter),
    ]);

    // Get counts by status for dashboard
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      VideoComment.countDocuments({ ...( videoId ? { video: videoId } : {} ), status: 'pending' }),
      VideoComment.countDocuments({ ...( videoId ? { video: videoId } : {} ), status: 'approved' }),
      VideoComment.countDocuments({ ...( videoId ? { video: videoId } : {} ), status: 'rejected' }),
    ]);

    res.json({
      success: true,
      comments,
      total,
      page,
      pages: Math.ceil(total / limit),
      counts: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/videos/admin/comments/:commentId (admin - approve/reject)
exports.adminUpdateComment = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const comment = await VideoComment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const oldStatus = comment.status;
    comment.status = status;
    await comment.save();

    // Update commentsCount on video
    if (oldStatus !== 'approved' && status === 'approved') {
      await VideoImpact.findByIdAndUpdate(comment.video, { $inc: { commentsCount: 1 } });
    } else if (oldStatus === 'approved' && status !== 'approved') {
      await VideoImpact.findByIdAndUpdate(comment.video, { $inc: { commentsCount: -1 } });
    }

    const populated = await comment.populate([
      { path: 'user', select: 'name email avatar' },
      { path: 'video', select: 'title thumbnailUrl' },
    ]);

    res.json({ success: true, comment: populated });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/videos/admin/comments/:commentId (admin)
exports.adminDeleteComment = async (req, res, next) => {
  try {
    const comment = await VideoComment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const wasApproved = comment.status === 'approved';
    await VideoComment.deleteOne({ _id: comment._id });

    if (wasApproved) {
      await VideoImpact.findByIdAndUpdate(comment.video, { $inc: { commentsCount: -1 } });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/videos/admin/comments/bulk-action (admin - bulk approve/reject/delete)
exports.adminBulkAction = async (req, res, next) => {
  try {
    const { commentIds, action } = req.body;
    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'commentIds array is required' });
    }
    if (!['approve', 'reject', 'delete'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve, reject, or delete' });
    }

    const comments = await VideoComment.find({ _id: { $in: commentIds } });

    if (action === 'delete') {
      // Decrement commentsCount for each approved comment being deleted
      const approvedVideoIds = comments.filter(c => c.status === 'approved').map(c => c.video);
      for (const vid of approvedVideoIds) {
        await VideoImpact.findByIdAndUpdate(vid, { $inc: { commentsCount: -1 } });
      }
      await VideoComment.deleteMany({ _id: { $in: commentIds } });
    } else {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      for (const comment of comments) {
        if (comment.status !== newStatus) {
          if (comment.status !== 'approved' && newStatus === 'approved') {
            await VideoImpact.findByIdAndUpdate(comment.video, { $inc: { commentsCount: 1 } });
          } else if (comment.status === 'approved' && newStatus !== 'approved') {
            await VideoImpact.findByIdAndUpdate(comment.video, { $inc: { commentsCount: -1 } });
          }
        }
      }
      await VideoComment.updateMany({ _id: { $in: commentIds } }, { status: newStatus });
    }

    res.json({ success: true, message: `${action} completed for ${commentIds.length} comments` });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/videos/admin/likes (admin - likes overview)
exports.adminGetLikes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { videoId } = req.query;

    const filter = {};
    if (videoId) filter.video = videoId;

    const [likes, total] = await Promise.all([
      VideoLike.find(filter)
        .populate('user', 'name email avatar')
        .populate('video', 'title thumbnailUrl')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      VideoLike.countDocuments(filter),
    ]);

    res.json({
      success: true,
      likes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/videos/admin/likes/:likeId (admin)
exports.adminDeleteLike = async (req, res, next) => {
  try {
    const like = await VideoLike.findById(req.params.likeId);
    if (!like) {
      return res.status(404).json({ success: false, message: 'Like not found' });
    }

    await VideoLike.deleteOne({ _id: like._id });
    await VideoImpact.findByIdAndUpdate(like.video, { $inc: { likesCount: -1 } });

    res.json({ success: true, message: 'Like removed' });
  } catch (error) {
    next(error);
  }
};
