const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getDailyDonations,
  getMonthlyDonations,
  getCategoryWiseDonations,
} = require('../controllers/analyticsController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/daily', getDailyDonations);
router.get('/monthly', getMonthlyDonations);
router.get('/categories', getCategoryWiseDonations);

module.exports = router;
