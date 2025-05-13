const express = require("express");
const { registerUser,getRoleRegistrationsCount } = require("../controllers/userController");

const router = express.Router();
router.post("/register", registerUser);
router.get('/:eventID/role-registrations', getRoleRegistrationsCount);
module.exports = router;
