const crypto = require('crypto');
const axios = require('axios');

const UPI_ID = '7340539497@kotak811';

// ─── PhonePe Config ───
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENV || 'production';

const PHONEPE_BASE_URL =
  PHONEPE_ENV === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// ─── UPI helpers (kept as fallback) ───
const generateUPILink = (amount, name = 'Donor', note = 'VoiceForHelp Donation') => {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: 'Vageesh Sharma',
    // pn: 'VoiceForHelp',
    am: String(amount),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
};

const generateUPIQRData = (amount, transactionRef = '') => {
  return {
    upiId: UPI_ID,
    amount,
    payeeName: 'Vageesh Sharma',
    // payeeName: 'VoiceForHelp',
    upiLink: generateUPILink(amount),
    transactionRef,
  };
};

// ─── PhonePe: Generate checksum ───
function generateChecksum(payload, endpoint) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const string = base64Payload + endpoint + PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + PHONEPE_SALT_INDEX;
  return { base64Payload, checksum };
}

// ─── PhonePe: Verify callback checksum ───
function verifyChecksum(base64Response, xVerifyHeader) {
  const string = base64Response + '/pg/v1/status' + PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const expectedChecksum = sha256 + '###' + PHONEPE_SALT_INDEX;
  return xVerifyHeader === expectedChecksum;
}

// ─── PhonePe: Initiate payment ───
async function initiatePhonePePayment(amount, merchantTransactionId, donorName, donorPhone) {
  if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
    throw new Error('PhonePe credentials not configured');
  }

  const payload = {
    merchantId: PHONEPE_MERCHANT_ID,
    merchantTransactionId,
    merchantUserId: `MUID_${donorPhone}`,
    amount: amount * 100, // PhonePe expects amount in paise
    redirectUrl: `${CLIENT_URL}/donate/status?txnId=${merchantTransactionId}`,
    redirectMode: 'REDIRECT',
    callbackUrl: `${SERVER_URL}/api/donations/phonepe/callback`,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const endpoint = '/pg/v1/pay';
  const { base64Payload, checksum } = generateChecksum(payload, endpoint);

  const response = await axios.post(
    `${PHONEPE_BASE_URL}${endpoint}`,
    { request: base64Payload },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
    }
  );

  if (response.data.success && response.data.data?.instrumentResponse?.redirectInfo?.url) {
    return {
      success: true,
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
      merchantTransactionId,
    };
  }

  throw new Error(response.data.message || 'Failed to initiate PhonePe payment');
}

// ─── PhonePe: Check payment status ───
async function checkPhonePeStatus(merchantTransactionId) {
  if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
    throw new Error('PhonePe credentials not configured');
  }

  const endpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
  const string = endpoint + PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + PHONEPE_SALT_INDEX;

  const response = await axios.get(`${PHONEPE_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
    },
  });

  return response.data;
}

// ─── Check if PhonePe is configured ───
function isPhonePeConfigured() {
  return !!(PHONEPE_MERCHANT_ID && PHONEPE_SALT_KEY);
}

module.exports = {
  generateUPILink,
  generateUPIQRData,
  initiatePhonePePayment,
  checkPhonePeStatus,
  verifyChecksum,
  isPhonePeConfigured,
};
