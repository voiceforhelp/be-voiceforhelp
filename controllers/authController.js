const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetSuccessEmail } = require('../services/emailService');

// Generate 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ─── STEP 1: Register - send OTP to email ───
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Delete any existing unverified user with same email so they can re-register
    if (existingUser && !existingUser.isVerified) {
      await User.findByIdAndDelete(existingUser._id);
    }

    // Create user (unverified)
    const user = await User.create({ name, email, phone, password, isVerified: false });

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.deleteMany({ email, purpose: 'register' });
    await OTP.create({ email, otp, purpose: 'register' });

    // Send OTP email
    await sendOTPEmail(email, otp, 'register');

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      email,
      requiresOTP: true,
    });
  } catch (error) {
    next(error);
  }
};

// ─── STEP 2: Verify registration OTP ───
// @route   POST /api/auth/verify-register
exports.verifyRegister = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, purpose: 'register' });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please register again.' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteMany({ email, purpose: 'register' });
      return res.status(429).json({ success: false, message: 'Too many attempts. Please register again.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register again.' });
    }

    // Cleanup OTP
    await OTP.deleteMany({ email, purpose: 'register' });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch((err) => console.error('Welcome email error:', err));

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login with password ───
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      // Resend OTP for unverified users
      const otp = generateOTP();
      await OTP.deleteMany({ email, purpose: 'register' });
      await OTP.create({ email, otp, purpose: 'register' });
      await sendOTPEmail(email, otp, 'register');

      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent to your email.',
        requiresOTP: true,
        email,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password - send OTP ───
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ success: true, message: 'If this email is registered, you will receive an OTP.' });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email, purpose: 'reset-password' });
    await OTP.create({ email, otp, purpose: 'reset-password' });

    await sendOTPEmail(email, otp, 'reset-password');

    res.json({ success: true, message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    next(error);
  }
};

// ─── Verify forgot password OTP ───
// @route   POST /api/auth/verify-reset-otp
exports.verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, purpose: 'reset-password' });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteMany({ email, purpose: 'reset-password' });
      return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Generate a temporary reset token (valid 15 min)
    const resetToken = crypto.randomBytes(32).toString('hex');
    otpRecord.otp = resetToken; // reuse OTP record to store reset token
    otpRecord.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await otpRecord.save();

    res.json({ success: true, message: 'OTP verified. You can now reset your password.', resetToken });
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ───
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const otpRecord = await OTP.findOne({ email, purpose: 'reset-password', otp: resetToken });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    // Cleanup
    await OTP.deleteMany({ email, purpose: 'reset-password' });

    // Send success email (non-blocking)
    sendPasswordResetSuccessEmail(email, user.name).catch((err) => console.error('Reset email error:', err));

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};

// ─── Resend OTP ───
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    if (!['register', 'reset-password'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid purpose.' });
    }

    // Rate limit: check if OTP was sent less than 60 seconds ago
    const recentOTP = await OTP.findOne({ email, purpose }).sort('-createdAt');
    if (recentOTP) {
      const timeSince = Date.now() - recentOTP.createdAt.getTime();
      if (timeSince < 60000) {
        const waitSeconds = Math.ceil((60000 - timeSince) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
        });
      }
    }

    if (purpose === 'register') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Please register first.' });
      }
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email already verified. Please login.' });
      }
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email, purpose });
    await OTP.create({ email, otp, purpose });

    await sendOTPEmail(email, otp, purpose);

    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
