const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  createDonation,
  createFastDonation,
  getDonations,
  getDonationsByGroupDate,
  getMyDonations,
  getDonationStats,
  getRecentDonors,
  updateDonationStatus,
} = require('../controllers/donationController');

// Public
router.get('/recent', getRecentDonors);

router.post(
  '/fast',
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least ₹1'),
  ],
  validate,
  createFastDonation
);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least ₹1'),
  ],
  validate,
  createDonation
);

// Protected - User
router.get('/my', protect, getMyDonations);

// Protected - Admin
router.get('/', protect, authorize('admin'), getDonations);
router.get('/stats', protect, authorize('admin'), getDonationStats);
router.get('/group/:date', protect, authorize('admin'), getDonationsByGroupDate);
router.put('/:id/status', protect, authorize('admin'), updateDonationStatus);

module.exports = router;
