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

  // Generate thumbnail URL from Cloudinary video URL
  // e.g. .../video/upload/v123/folder/file.mp4 → .../video/upload/w_640,h_360,c_fill,so_2/v123/folder/file.jpg
  let thumbnailUrl = '';
  const videoUrl = req.file.path;
  const uploadIndex = videoUrl.indexOf('/upload/');
  if (uploadIndex !== -1) {
    const base = videoUrl.substring(0, uploadIndex + 8); // includes '/upload/'
    const rest = videoUrl.substring(uploadIndex + 8);
    thumbnailUrl = base + 'w_640,h_360,c_fill,so_2/' + rest.replace(/\.[^.]+$/, '.jpg');
  }

  res.json({ success: true, url: videoUrl, thumbnailUrl, filename: req.file.filename });
});

module.exports = router;
