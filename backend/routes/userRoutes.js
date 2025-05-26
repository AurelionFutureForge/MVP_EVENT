const express = require("express");
const { registerUser,getRoleRegistrationsCount,checkEmail,getUsersByTransactionID } = require("../controllers/userController");

const router = express.Router();
router.post("/register", registerUser);
router.get('/:eventID/role-registrations', getRoleRegistrationsCount);
router.post('/check-email',checkEmail);
router.get('/by-transaction/:transactionID',getUsersByTransactionID)
module.exports = router;
