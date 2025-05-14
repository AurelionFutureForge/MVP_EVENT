const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');

const initiatePayment = async (req, res) => { 
  try {
    const { amount, email, eventId } = req.body;

    if (!amount || !email || !eventId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Initiate Payment Request Body:', req.body);

    // Load environment variables
    const merchantId = process.env.PHONEPE_MERCHANT_ID?.trim();
    const saltKey = process.env.PHONEPE_SALT_KEY?.trim();
    const saltIndex = process.env.PHONEPE_SALT_INDEX?.trim();
    const baseUrl = process.env.PHONEPE_BASE_URL?.trim();

    if (!merchantId || !saltKey || !saltIndex || !baseUrl) {
      return res.status(500).json({ error: 'Missing necessary environment variables' });
    }

    const apiPath =  "/apis/pg-sandbox/pg/v1/pay";
    const transactionId = `TXN_${Date.now()}`;
    const redirectUrl = `https://mvp-event.vercel.app/payment-success?transactionId=${transactionId}`;
    const callbackUrl = 'https://mvp-event.onrender.com/api/phonepe/verify-payment';

    const payload = {
      merchantId,
      transactionId,
      merchantUserId: email,
      amount: amount * 100, // Convert to paise
      redirectUrl,
      callbackUrl,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    console.log("payload:",payload);

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + apiPath + saltKey;
    const xVerify = crypto.createHash('sha256').update(stringToHash).digest("hex") + "###" + saltIndex;

    console.log("base64Payload :",base64Payload)
    console.log("stringToHash :",stringToHash )
    console.log("xVerify :",xVerify);

    console.log("path:",`${baseUrl}${apiPath}`);

    const response = await axios.post(
      `${baseUrl}${apiPath}`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId
        }
      }
    );

    const redirectLink = response?.data?.data?.instrumentResponse?.redirectInfo?.url;

    if (!redirectLink) {
      throw new Error('Redirect URL not found in the response');
    }

    res.json({ redirectUrl: redirectLink });

  } catch (err) {
    console.error('Error during payment initiation:', err.message);
    if (err.response) {
      console.error('Error Response:', err.response.data);
      console.error('Status Code:', err.response.status);
      console.error('Headers:', err.response.headers);
    } else if (err.request) {
      console.error('Request made but no response received:', err.request);
    } else {
      console.error('Unknown error:', err);
    }
    res.status(500).json({ error: 'Payment initiation failed',err });
  }
};

const verifyPayment = async (req, res) => {
  const { transactionId, email, eventId } = req.body;

  try {
    const merchantId = process.env.PHONEPE_MERCHANT_ID?.trim();
    const saltKey = process.env.PHONEPE_SALT_KEY?.trim();
    const saltIndex = process.env.PHONEPE_SALT_INDEX?.trim();
    const baseUrl = process.env.PHONEPE_BASE_URL?.trim();

    if (!merchantId || !saltKey || !saltIndex || !baseUrl) {
      return res.status(500).json({ error: 'Missing necessary environment variables' });
    }

    const path = `/apis/pg-sandbox/pg/v1/status/${merchantId}/${transactionId}`;
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
