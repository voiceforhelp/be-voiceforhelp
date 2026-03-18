const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadVideo: uploadVideoMiddleware } = require('../config/cloudinary');
const {
  uploadVideo,
  getVideos,
  getVideoById,
  getVideosByDonorGroup,
  getMyVideos,
  updateVideo,
  deleteVideo,
} = require('../controllers/videoController');

// Public
router.get('/', getVideos);
router.get('/:id', getVideoById);
router.get('/group/:date', getVideosByDonorGroup);

// Protected - User
router.get('/user/my', protect, getMyVideos);

// Protected - Admin
router.post('/', protect, authorize('admin'), uploadVideoMiddleware.single('video'), uploadVideo);
router.put('/:id', protect, authorize('admin'), updateVideo);
router.delete('/:id', protect, authorize('admin'), deleteVideo);

module.exports = router;
