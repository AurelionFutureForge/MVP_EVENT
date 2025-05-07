const express = require("express");
const router = express.Router();
const { privilegeLogin } = require("../controllers/privilegeController");

router.post("/login", privilegeLogin);

module.exports = router;
