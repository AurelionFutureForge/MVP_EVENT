const express = require("express");
const { adminLogin, getAllUsers, registerAdmin, getEventPrivileges, assignPrivileges} = require("../controllers/authController"); // Ensure functions are correctly imported
const { authenticateAdmin } = require("../middleware/authMiddleware");
const {authenticatePrivilege} = require("../middleware/privilegeAuthMiddleware")

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

// Get all registered users (Admin only)
router.get("/users", authenticateAdmin, getAllUsers); // Ensure correct function reference

router.post("/register", registerAdmin);

router.post('/privileges', authenticateAdmin, createPrivilege);

router.put('/assign-privileges',authenticateAdmin, assignPrivilegeToUsers);

router.get('/event-privileges', authenticatePrivilege, getEventPrivileges);

router.post('/assign-privileges', authenticatePrivilege, assignPrivileges);





module.exports = router;
