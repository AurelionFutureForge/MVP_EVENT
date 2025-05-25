// routes/phonepeRoutes.js
const express = require('express');
const { initiatePayment, verifyPhonePeCallback} = require('../controllers/phonepeController');

const router = express.Router();

router.post('/initiate-payment', initiatePayment);
router.post('/phonepe-callback', verifyPhonePeCallback);

module.exports = router;
