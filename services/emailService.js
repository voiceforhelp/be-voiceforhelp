const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@voiceforhelp.com';
const FROM_NAME = process.env.FROM_NAME || 'VoiceForHelp';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

async function sendEmail({ to, subject, html }) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
  }

  await axios.post(BREVO_API_URL, {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  }, {
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
  });
}

// ─── Base email wrapper ───
function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #1B5E20, #2E7D32); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }
    .header h1 span { color: #FF9800; }
    .header p { color: #C8E6C9; margin: 5px 0 0; font-size: 13px; letter-spacing: 1px; }
    .body { padding: 30px 25px; }
    .footer { background: #1a1a2e; padding: 25px; text-align: center; color: #9e9e9e; font-size: 12px; }
    .footer a { color: #4CAF50; text-decoration: none; }
    .btn { display: inline-block; background: #2E7D32; color: #ffffff !important; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .otp-box { background: #E8F5E9; border: 2px dashed #4CAF50; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 36px; font-weight: 800; color: #1B5E20; letter-spacing: 8px; font-family: monospace; }
    .info-card { background: #f8f9fa; border-radius: 10px; padding: 18px; margin: 15px 0; border-left: 4px solid #4CAF50; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-label { color: #666; font-size: 13px; }
    .info-value { color: #333; font-weight: 600; font-size: 14px; }
    .divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    h2 { color: #1B5E20; margin: 0 0 15px; }
    p { color: #555; line-height: 1.6; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Voice<span>For</span>Help</h1>
      <p>BE THE VOICE, BE THE CHANGE</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px;">
        <a href="${CLIENT_URL}">Website</a> &nbsp;|&nbsp;
        <a href="${CLIENT_URL}/donate">Donate</a> &nbsp;|&nbsp;
        <a href="${CLIENT_URL}/videos">Impact Videos</a> &nbsp;|&nbsp;
        <a href="${CLIENT_URL}/contact">Contact</a>
      </p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} VoiceForHelp. All Rights Reserved.</p>
      <p style="margin: 5px 0 0; color: #666;">Rajasthan, India | +91-7737872585</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Send OTP email ───
async function sendOTPEmail(email, otp, purpose) {
  const purposeText = {
    'register': 'verify your email and complete registration',
    'login': 'log in to your account',
    'reset-password': 'reset your password',
  };

  const subjectText = {
    'register': 'Verify Your Email - VoiceForHelp',
    'login': 'Login OTP - VoiceForHelp',
    'reset-password': 'Reset Password OTP - VoiceForHelp',
  };

  const html = emailWrapper(`
    <h2>Your Verification Code</h2>
    <p>Hello! Use the OTP below to <strong>${purposeText[purpose]}</strong>.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p style="margin: 10px 0 0; color: #666; font-size: 13px;">Valid for 10 minutes</p>
    </div>
    <p style="color: #999; font-size: 13px;">If you didn't request this, please ignore this email. Do not share this OTP with anyone.</p>
  `);

  await sendEmail({ to: email, subject: subjectText[purpose], html });
}

// ─── Welcome email after registration ───
async function sendWelcomeEmail(user) {
  const html = emailWrapper(`
    <h2>Welcome to VoiceForHelp! 🎉</h2>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Thank you for joining our mission to bring transparency to charitable giving. Your account has been verified and is ready to use!</p>
    <div class="info-card">
      <p style="margin: 0;"><strong>What you can do:</strong></p>
      <ul style="color: #555; padding-left: 20px;">
        <li>Donate to causes you care about</li>
        <li>See daily video proof of how your donations are used</li>
        <li>Track your donation history</li>
        <li>Volunteer for our initiatives</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${CLIENT_URL}/donate" class="btn">Make Your First Donation</a>
    </div>
    <p>Every rupee is accounted for. Every impact is recorded.</p>
  `);

  await sendEmail({ to: user.email, subject: `Welcome to VoiceForHelp, ${user.name}!`, html });
}

// ─── Donation confirmation email ───
async function sendDonationConfirmationEmail(donation) {
  if (!donation.email) return;

  const html = emailWrapper(`
    <h2>Thank You for Your Donation!</h2>
    <p>Hi <strong>${donation.name}</strong>,</p>
    <p>We've received your donation and it's being processed. Your generosity makes a real difference!</p>
    <div class="info-card">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr><td class="info-label">Amount</td><td class="info-value" style="text-align:right;">₹${donation.amount.toLocaleString('en-IN')}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"></td></tr>
        <tr><td class="info-label">Donation ID</td><td class="info-value" style="text-align:right;">${donation._id}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"></td></tr>
        <tr><td class="info-label">Date</td><td class="info-value" style="text-align:right;">${new Date(donation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"></td></tr>
        <tr><td class="info-label">Group Date</td><td class="info-value" style="text-align:right;">${donation.donationGroupDate}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"></td></tr>
        <tr><td class="info-label">Status</td><td class="info-value" style="text-align:right; color: #FF9800;">Pending Verification</td></tr>
      </table>
    </div>
    <p>📹 <strong>Transparency Promise:</strong> You will receive a video showing exactly how your donation was utilized. This video will be shared within 24 hours.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${CLIENT_URL}/profile" class="btn">Track Your Donation</a>
    </div>
    <p style="color: #999; font-size: 13px;">Payment verification may take a few minutes. You'll receive a confirmation once verified.</p>
  `);

  await sendEmail({ to: donation.email, subject: `Donation Received - ₹${donation.amount.toLocaleString('en-IN')} | VoiceForHelp`, html });
}

// ─── Donation status update email ───
async function sendDonationStatusEmail(donation, status) {
  if (!donation.email) return;

  const isCompleted = status === 'completed';
  const statusColor = isCompleted ? '#4CAF50' : '#f44336';
  const statusText = isCompleted ? 'Completed' : 'Failed';

  const html = emailWrapper(`
    <h2>Donation ${statusText}</h2>
    <p>Hi <strong>${donation.name}</strong>,</p>
    <p>Your donation of <strong>₹${donation.amount.toLocaleString('en-IN')}</strong> has been <span style="color: ${statusColor}; font-weight: 600;">${statusText.toLowerCase()}</span>.</p>
    ${isCompleted ? `
    <div class="info-card">
      <p style="margin: 0;">✅ Your payment has been verified. Thank you for your generosity!</p>
      ${donation.transactionId ? `<p style="margin: 5px 0 0; font-size: 13px; color: #666;">Transaction ID: ${donation.transactionId}</p>` : ''}
    </div>
    <p>📹 An impact video showing how your donation was used will be uploaded soon. You'll receive an email with the link!</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${CLIENT_URL}/videos" class="btn">View Impact Videos</a>
    </div>
    ` : `
    <div class="info-card" style="border-left-color: #f44336;">
      <p style="margin: 0;">Your payment could not be verified. If you believe this is an error, please contact us.</p>
    </div>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${CLIENT_URL}/contact" class="btn" style="background: #f44336;">Contact Support</a>
    </div>
    `}
  `);

  await sendEmail({ to: donation.email, subject: `Donation ${statusText} - ₹${donation.amount.toLocaleString('en-IN')} | VoiceForHelp`, html });
}

// ─── Video uploaded - notify donors of that group date ───
async function sendVideoNotificationEmail(donorEmail, donorName, video) {
  const html = emailWrapper(`
    <h2>Your Impact Video is Ready! 📹</h2>
    <p>Hi <strong>${donorName}</strong>,</p>
    <p>Great news! A new impact video has been uploaded showing how donations from <strong>${video.donorGroupDate}</strong> were utilized.</p>
    <div class="info-card">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr><td class="info-label">Video Title</td><td class="info-value" style="text-align:right;">${video.title}</td></tr>
        ${video.description ? `<tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"></td></tr>
        <tr><td colspan="2" style="color:#555; font-size:13px;">${video.description}</td></tr>` : ''}
      </table>
    </div>
    ${video.thumbnailUrl ? `<div style="text-align:center; margin: 15px 0;"><img src="${video.thumbnailUrl}" alt="Video Thumbnail" style="max-width:100%; border-radius:10px;"></div>` : ''}
    <div style="text-align: center; margin: 25px 0;">
      <a href="${CLIENT_URL}/videos/${video._id}" class="btn">🎬 Watch Video</a>
    </div>
    ${video.socialLinks && (video.socialLinks.instagram || video.socialLinks.youtube || video.socialLinks.facebook) ? `
    <div style="text-align: center; margin: 15px 0; font-size: 13px; color: #666;">
      Also available on:
      ${video.socialLinks.instagram ? `<a href="${video.socialLinks.instagram}" style="color: #E1306C; margin: 0 5px;">Instagram</a>` : ''}
      ${video.socialLinks.youtube ? `<a href="${video.socialLinks.youtube}" style="color: #FF0000; margin: 0 5px;">YouTube</a>` : ''}
      ${video.socialLinks.facebook ? `<a href="${video.socialLinks.facebook}" style="color: #1877F2; margin: 0 5px;">Facebook</a>` : ''}
    </div>` : ''}
    <p>This is our promise of transparency. Every rupee you donate is accounted for.</p>
  `);

  await sendEmail({ to: donorEmail, subject: `🎬 Your Impact Video is Ready! | VoiceForHelp`, html });
}

// ─── Password reset success email ───
async function sendPasswordResetSuccessEmail(email, name) {
  const html = emailWrapper(`
    <h2>Password Reset Successful</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your password has been successfully reset. You can now log in with your new password.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${CLIENT_URL}/login" class="btn">Login Now</a>
    </div>
    <p style="color: #999; font-size: 13px;">If you didn't reset your password, please contact us immediately at support@voiceforhelp.com</p>
  `);

  await sendEmail({ to: email, subject: 'Password Reset Successful - VoiceForHelp', html });
}

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendDonationConfirmationEmail,
  sendDonationStatusEmail,
  sendVideoNotificationEmail,
  sendPasswordResetSuccessEmail,
};
