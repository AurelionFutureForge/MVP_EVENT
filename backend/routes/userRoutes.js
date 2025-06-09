const express = require("express");
const { registerUser,getRoleRegistrationsCount,checkEmail,getUsersByTransactionID, freeRegisterUser, getUsersById } = require("../controllers/userController");

const router = express.Router();
router.post("/register", registerUser);
router.post("/freeRegister",freeRegisterUser)
router.get('/:eventID/role-registrations', getRoleRegistrationsCount);
router.post('/check-email',checkEmail);
router.get('/by-transaction/:transactionID',getUsersByTransactionID)
router.get('/by-id/:eventID/:decodedEmail',getUsersById);
module.exports = router;
