const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { createVolunteer, getVolunteers, updateVolunteerStatus } = require('../controllers/volunteerController');

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('availabilityType').isIn(['weekends', 'alternate_days', 'festivals', 'specific_dates']).withMessage('Valid availability type is required'),
  ],
  validate,
  createVolunteer
);

router.get('/', protect, authorize('admin'), getVolunteers);
router.put('/:id/status', protect, authorize('admin'), updateVolunteerStatus);

module.exports = router;
