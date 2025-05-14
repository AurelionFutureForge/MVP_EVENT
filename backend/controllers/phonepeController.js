const User = require('../models/User')
const axios = require('axios');
const crypto = require('crypto');


const initiatePayment = async (req, res) => {
  try {
    const { amount, email, eventId } = req.body;

    console.log('Initiate Payment Request Body:', req.body);

    const merchantId = process.env.PHONEPE_MERCHANT_ID.trim();
    const saltKey = process.env.PHONEPE_SALT_KEY.trim();
    const saltIndex = process.env.PHONEPE_SALT_INDEX.trim();
    const baseUrl = process.env.PHONEPE_BASE_URL.trim();

    console.log("Merchant ID:", `"${merchantId}"`);
    console.log("Salt Key:", `"${saltKey}"`);
    console.log("Salt Index:", `"${saltIndex}"`);
    console.log("Base URL:", `"${baseUrl}"`);

    const transactionId = `TXN_${Date.now()}`;
    const redirectUrl = `https://mvp-event.vercel.app/payment-success?transactionId=${transactionId}`;
    const callbackUrl = 'https://mvp-event.onrender.com/api/phonepe/verify-payment';

    const payload = {
      merchantId,
      transactionId,
      merchantUserId: email,
      amount: amount * 100, // Convert rupees to paise
      redirectUrl,
      callbackUrl,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    console.log('Payload being sent to PhonePe:', payload);

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const xVerify = crypto.createHash('sha256').update(stringToHash).digest("hex") + "###" + saltIndex;

    console.log('Base64 Encoded Payload:', base64Payload);
    console.log("stringToHash:", stringToHash);
    console.log("X-VERIFY:", xVerify);
    console.log("Full Endpoint:", `${baseUrl}/v1/pay`);

    const response = await axios.post(
      `${baseUrl}/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
          'Content-Length': Buffer.byteLength(JSON.stringify({ request: base64Payload }))
        }
      }
    );

    console.log('Generated xVerify Hash:', xVerify);

    const redirectLink = response.data.data.instrumentResponse.redirectInfo.url;

    console.log('Redirect URL:', redirectLink);

    res.json({ redirectUrl: redirectLink });

  } catch (err) {
    if (err.response) {
      console.error("PhonePe Error Response:", err.response.data);
      return res.status(400).json({ error: err.response.data });
    }
    console.error("Unexpected Error:", err.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};
 const verifyPayment = async (req, res) => {
  const { transactionId, email, eventId } = req.body;

  try {
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const baseUrl = process.env.PHONEPE_BASE_URL;

    // Construct the string to hash
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

module.exports = {initiatePayment,verifyPayment};