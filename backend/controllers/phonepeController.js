const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');

const { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } = require('pg-sdk-node');
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
    const redirectUrl = `https://www.aurelionfutureforge.com/stagyn/payment-success?transactionId=${merchantOrderId}`;
    

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

const verifyPhonePeCallback = async (req, res) => {
  try {
    const authorization = req.headers['authorization'];
    const responseBody = JSON.stringify(req.body);

    console.log("authorisation :",authorization);
    console.log("responseBody :",responseBody);

    const username = process.env.PHONEPE_CALLBACK_USERNAME?.trim();
    const password = process.env.PHONEPE_CALLBACK_PASSWORD?.trim();

    if (!authorization || !username || !password) {
      return res.status(400).json({ error: 'Missing required credentials or authorization header' });
    }

    const callbackResponse = client.validateCallback(
      username,
      password,
      authorization,
      responseBody
    );

    console.log("callbackResponse :",callbackResponse);

    const { type, payload } = callbackResponse;

    console.log('PhonePe callback verified:', {
      eventType: type,
      merchantOrderId: payload.merchantOrderId,
      orderId: payload.orderId,
      state: payload.state,
      metaInfo: payload.metaInfo
    });

    if (payload.state === 'COMPLETED') {
      const email = payload.metaInfo.udf1;
      const eventId = payload.metaInfo.udf2;
      const transactionId = payload.merchantOrderId;

      if (!email || !eventId) {
        console.error("Missing email or eventId in metaInfo");
        return res.status(400).json({ success: false, message: "Invalid webhook payload, missing email or eventId" });
      }

      const existingUser = await User.findOne({ email, eventId });

      if (existingUser) {
        console.log(`Registration canceled: User with email ${email} already exists for event ${eventId}.`);
        return res.status(409).json({ 
          success: false, 
          message: `User with email ${email} already registered for this event.` 
        });
      }
      try {
        await User.create({ email, eventId, transactionId, paymentStatus: 'COMPLETED' });
        console.log(`User registered for transaction ${transactionId}`);
      } catch (createError) {
        console.error("Failed to create user:", createError);
        return res.status(500).json({ success: false, message: "User creation failed", error: createError.message });
      }

      return res.status(200).json({ success: true, message: "User registered after payment success" });
    } else {
      console.log(`Payment state is ${payload.state}, no user registration performed.`);
      return res.status(200).json({ success: true, message: `Payment state is ${payload.state}` });
    }
  } catch (err) {
    console.error('Callback verification failed:', err);
    return res.status(403).json({
      success: false,
      message: 'Invalid or tampered callback data',
      error: err.message
    });
  }
};


module.exports = { initiatePayment, verifyPhonePeCallback };
