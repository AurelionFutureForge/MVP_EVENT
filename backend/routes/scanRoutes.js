const express = require("express");
const { verifyQRCode, claimPrivilege } = require("../controllers/scanController");
const { authenticateAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/verify", authenticateAdmin, verifyQRCode);


module.exports = router;
