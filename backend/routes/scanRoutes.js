const express = require("express");
const { verifyQRCode, claimPrivilege } = require("../controllers/scanController");
const { authenticateAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/verify", authenticateAdmin, verifyQRCode);
router.post("/claim", authenticateAdmin, claimPrivilege);  // Universal claim route

module.exports = router;
