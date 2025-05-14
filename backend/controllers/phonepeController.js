const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');

const initiatePayment = async (req, res) => {
  try {
    const { amount, email, eventId } = req.body;
    console.log('Initiate Payment Request Body:', req.body);

    // Load credentials from environment variables
    const merchantId = process.env.PHONEPE_MERCHANT_ID?.trim();
    const saltKey = process.env.PHONEPE_SALT_KEY?.trim();
    const saltIndex = process.env.PHONEPE_SALT_INDEX?.trim();
    const baseUrl = process.env.PHONEPE_BASE_URL?.trim(); // e.g., https://api.phonepe.com/apis/hermes

    if (!merchantId || !saltKey || !saltIndex || !baseUrl) {
      return res.status(500).json({ error: 'Missing PhonePe configuration in environment variables' });
    }

    // Create unique transaction ID
    const transactionId = `TXN_${Date.now()}`;

    // Redirect and callback URLs
    const redirectUrl = `https://mvp-event.vercel.app/payment-success?transactionId=${transactionId}`;
    const callbackUrl = 'https://mvp-event.onrender.com/api/phonepe/verify-payment';

    // Prepare payload
    const payload = {
      merchantId,
      transactionId,
      merchantUserId: email,
      amount: amount * 100, // Amount in paise
      redirectUrl,
      callbackUrl,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // Convert payload to Base64
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    // Create the SHA256 hash for X-VERIFY
    const stringToHash = base64Payload + "/pg/v1/initiate" + saltKey;
    const xVerify = crypto.createHash("sha256").update(stringToHash).digest("hex") + "###" + saltIndex;

    // Send request to PhonePe
    const phonePeResponse = await axios.post(
      `${baseUrl}/pg/v1/initiate`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId
        }
      }
    );

    const redirectLink = phonePeResponse.data?.data?.instrumentResponse?.redirectInfo?.url;

    if (!redirectLink) {
      throw new Error('Redirect URL not found in PhonePe response');
    }

    res.json({ redirectUrl: redirectLink });

  } catch (err) {
    console.error('Error during payment initiation:', err.message);

    if (err.response) {
      console.error('Error Response:', err.response.data);
      console.error('Status Code:', err.response.status);
      console.error('Headers:', err.response.headers);
      return res.status(err.response.status).json({ error: err.response.data?.message || 'PhonePe error' });
    } else if (err.request) {
      console.error('Request made but no response received:', err.request);
      return res.status(500).json({ error: 'No response received from PhonePe' });
    } else {
      console.error('Unknown error:', err);
      return res.status(500).json({ error: 'Payment initiation failed' });
    }
  }
};
const verifyPayment = async (req, res) => {
  const { transactionId, email, eventId } = req.body;

  try {
    const merchantId = process.env.PHONEPE_MERCHANT_ID.trim();
    const saltKey = process.env.PHONEPE_SALT_KEY.trim();
    const saltIndex = process.env.PHONEPE_SALT_INDEX.trim();
    const baseUrl = process.env.PHONEPE_BASE_URL.trim();

    const path = `/pg/v1/status/${merchantId}/${transactionId}`;
    const stringToHash = path + saltKey;
    const xVerify = crypto.createHash('sha256').update(stringToHash).digest('hex') + "###" + saltIndex;

    const response = await axios.get(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': merchantId
      }
    });

    const paymentStatus = response.data.data?.state;

    if (paymentStatus === 'COMPLETED') {
      await User.findOneAndUpdate(
        { email, eventID: eventId },
        { $set: { transactionId, paymentStatus: 'COMPLETED' } }
      );

      return res.status(200).json({ success: true, message: "Payment verified and saved." });
    } else {
      return res.status(200).json({ success: false, message: "Payment not completed." });
    }

  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, error: "Internal server error during payment verification" });
  }
};

module.exports = { initiatePayment, verifyPayment };
