// routes/phonepeRoutes.js
import express from 'express';
import { initiatePayment, verifyPayment } from '../controllers/phonepeController.js';

const router = express.Router();

router.post('/initiate-payment', initiatePayment);
router.post('/verify-payment',verifyPayment);

module.exports = router;
