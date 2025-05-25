const express = require("express");
const { registerUser,getRoleRegistrationsCount,checkEmail } = require("../controllers/userController");

const router = express.Router();
router.post("/register", registerUser);
router.get('/:eventID/role-registrations', getRoleRegistrationsCount);
router.post('/check-email,checkEmail')
module.exports = router;
