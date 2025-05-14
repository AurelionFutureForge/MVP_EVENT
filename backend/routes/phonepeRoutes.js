// routes/phonepeRoutes.js
const express = require('express');
const { initiatePayment, verifyPayment } = require('../controllers/phonepeController');

const router = express.Router();

router.post('/initiate-payment', initiatePayment);
router.post('/verify-payment',verifyPayment);

module.exports = router;
