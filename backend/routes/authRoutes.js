const express = require("express");
const { adminLogin, getAllUsers, registerAdmin, getRoles, createPrivilege, assignPrivilegeToUsers } = require("../controllers/authController"); // Ensure functions are correctly imported
const { authenticateAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

// Get all registered users (Admin only)
router.get("/users", authenticateAdmin, getAllUsers); // Ensure correct function reference

router.post("/register", registerAdmin);

router.get('/roles', authenticateAdmin, getRoles);

router.post('/privileges', authenticateAdmin, createPrivilege);

router.put('/assign-privileges', authenticateAdmin, assignPrivilegeToUsers);




module.exports = router;
