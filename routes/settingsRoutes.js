const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPublicSettings,
  getAllSettings,
  upsertSetting,
  bulkUpdateSettings,
  deleteSetting,
} = require('../controllers/settingsController');

// Public route
router.get('/public', getPublicSettings);

// Admin routes
router.get('/', protect, authorize('admin'), getAllSettings);
router.put('/', protect, authorize('admin'), upsertSetting);
router.put('/bulk', protect, authorize('admin'), bulkUpdateSettings);
router.delete('/:id', protect, authorize('admin'), deleteSetting);

module.exports = router;
