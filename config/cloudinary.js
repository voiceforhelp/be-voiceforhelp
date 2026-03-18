const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'voiceforhelp/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'voiceforhelp/videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    resource_type: 'video',
  },
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = { cloudinary, uploadImage, uploadVideo };
