const express = require("express");
const { verifyQRCode, claimEntry, claimLunch, claimGift } = require("../controllers/scanController");
const { authenticateAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/verify", authenticateAdmin, verifyQRCode);
router.post("/claim-entry", authenticateAdmin, claimEntry);
router.post("/claim-lunch", authenticateAdmin, claimLunch);
router.post("/claim-gift", authenticateAdmin, claimGift);

module.exports = router;
