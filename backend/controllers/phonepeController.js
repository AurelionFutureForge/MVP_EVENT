const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');

const { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } =  require('pg-sdk-node');
const dotenv = require('dotenv');

dotenv.config(); // Load env vars
const client = StandardCheckoutClient.getInstance(
  process.env.PHONEPE_MERCHANT_ID?.trim(),
  process.env.PHONEPE_SALT_KEY?.trim(),
  Number(process.env.PHONEPE_CLIENT_VERSION || 1),
  process.env.PHONEPE_ENV === "production" ? Env.PRODUCTION : Env.SANDBOX 
);

const initiatePayment = async (req, res) => {
  try {
    const { amount, email, eventId } = req.body;

    if (!amount || !email || !eventId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const merchantOrderId = `TXN_${Date.now()}_${eventId}`;
    const redirectUrl =`https://events.aurelionfutureforge.com/payment-success?transactionId=${merchantOrderId}`;
    
    const metaInfo = MetaInfo.builder()
      .udf1(email)
      .udf2(eventId)
      .build();

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount * 100) // in paise
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    const response = await client.pay(request);
    const redirectLink = response.redirectUrl;

    if (!redirectLink) {
      throw new Error('Redirect URL not received from PhonePe SDK');
    }

    return res.json({ redirectUrl: redirectLink });
  } catch (err) {
    console.error('Error during SDK payment initiation:', err);
    return res.status(500).json({ error: 'Payment initiation failed', details: err.message });
  }
};

const verifyPayment = async (req, res) => {
  const { transactionId } = req.body;

  try {
    const merchantId = process.env.PHONEPE_MERCHANT_ID?.trim();
    const saltKey = process.env.PHONEPE_SALT_KEY?.trim();
    const saltIndex = process.env.PHONEPE_SALT_INDEX?.trim();
    const baseUrl = process.env.PHONEPE_BASE_URL?.trim();

    if (!merchantId || !saltKey || !saltIndex || !baseUrl) {
      return res.status(500).json({ error: 'Missing necessary environment variables' });
    }

    const path = `/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`;
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
      return res.status(200).json({ success: true, message: "Payment verified." });
    } else {
      return res.status(200).json({ success: false, message: "Payment not completed." });
    }

  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, error: "Internal server error during payment verification" });
  }
};



module.exports = { initiatePayment, verifyPayment };
