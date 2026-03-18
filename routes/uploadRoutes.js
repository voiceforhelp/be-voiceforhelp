const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../config/cloudinary');

router.post('/image', protect, authorize('admin'), uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  res.json({ success: true, url: req.file.path, filename: req.file.filename });
});

router.post('/video', protect, authorize('admin'), uploadVideo.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No video file provided' });
  }
  res.json({ success: true, url: req.file.path, filename: req.file.filename });
});

module.exports = router;
