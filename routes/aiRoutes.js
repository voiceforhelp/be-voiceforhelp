const express = require('express');
const router = express.Router();
const { generateAIContent, generateAIVideoContent, regenerateAIContent } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.post('/generate-content', generateAIContent);
router.post('/generate-video-content', generateAIVideoContent);
router.post('/regenerate-content', regenerateAIContent);

module.exports = router;
