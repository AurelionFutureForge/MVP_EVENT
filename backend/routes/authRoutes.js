const express = require("express");
const { adminLogin, getAllUsers, registerAdmin,manageAccess,getAccessGrants,revokeAccess } = require("../controllers/authController"); // Ensure functions are correctly imported
const { authenticateAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

// Get all registered users (Admin only)
router.get("/users", authenticateAdmin, getAllUsers); // Ensure correct function reference

router.post("/register", registerAdmin);

router.post('/manage-access', manageAccess);

// Get list of access grants for the admin's company
router.get('/access-grants/:companyName', getAccessGrants);

// Revoke access for a specific user
router.delete('/revoke-access/:userId', revokeAccess);

module.exports = router;
