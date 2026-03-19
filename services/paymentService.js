const UPI_ID = '7737872585@ptaxis';

const generateUPILink = (amount, name = 'Donor', note = 'VoiceForHelp Donation') => {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: 'VoiceForHelp',
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
    payeeName: 'VoiceForHelp',
    upiLink: generateUPILink(amount),
    transactionRef,
  };
};

// PhonePe integration stub - ready for future implementation
const initiatePhonePePayment = async (amount, transactionId, userId) => {
  // TODO: Implement when PhonePe merchant credentials are available
  // const merchantId = process.env.PHONEPE_MERCHANT_ID;
  // const secret = process.env.PHONEPE_SECRET;
  return {
    success: false,
    message: 'PhonePe integration coming soon. Please use UPI QR for now.',
  };
};

module.exports = { generateUPILink, generateUPIQRData, initiatePhonePePayment };
