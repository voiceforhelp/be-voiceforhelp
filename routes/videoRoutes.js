const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadVideo: uploadVideoMiddleware } = require('../config/cloudinary');
const {
  uploadVideo,
  getVideos,
  getVideoById,
  getVideosByDonorGroup,
  getRelatedVideos,
  getReelsFeed,
  getMyVideos,
  updateVideo,
  deleteVideo,
} = require('../controllers/videoController');
const {
  toggleLike,
  getLikeStatus,
  getComments,
  addComment,
  deleteComment,
  adminGetComments,
  adminUpdateComment,
  adminDeleteComment,
  adminBulkAction,
  adminGetLikes,
  adminDeleteLike,
} = require('../controllers/videoInteractionController');

// ═══ Admin - Comments & Likes Management ═══
router.get('/admin/comments', protect, authorize('admin'), adminGetComments);
router.put('/admin/comments/bulk-action', protect, authorize('admin'), adminBulkAction);
router.put('/admin/comments/:commentId', protect, authorize('admin'), adminUpdateComment);
router.delete('/admin/comments/:commentId', protect, authorize('admin'), adminDeleteComment);
router.get('/admin/likes', protect, authorize('admin'), adminGetLikes);
router.delete('/admin/likes/:likeId', protect, authorize('admin'), adminDeleteLike);

// Public
router.get('/', getVideos);
router.get('/feed/reels', getReelsFeed);
router.get('/group/:date', getVideosByDonorGroup);

// Protected - User
router.get('/user/my', protect, getMyVideos);

router.get('/:id/related', getRelatedVideos);

// Like & Comment routes (before /:id to avoid conflicts)
router.post('/:id/like', protect, toggleLike);
router.get('/:id/like-status', protect, getLikeStatus);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Public (keep /:id after specific routes)
router.get('/:id', getVideoById);

// Protected - Admin
router.post('/', protect, authorize('admin'), uploadVideoMiddleware.single('video'), uploadVideo);
router.put('/:id', protect, authorize('admin'), updateVideo);
router.delete('/:id', protect, authorize('admin'), deleteVideo);

module.exports = router;
