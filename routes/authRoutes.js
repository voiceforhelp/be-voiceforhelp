const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register,
  verifyRegister,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendOTP,
  getMe,
  updateProfile,
} = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/verify-register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyRegister
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
);

router.post(
  '/verify-reset-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyResetOTP
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  resetPassword
);

router.post(
  '/resend-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('purpose').isIn(['register', 'reset-password']).withMessage('Valid purpose is required'),
  ],
  validate,
  resendOTP
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
