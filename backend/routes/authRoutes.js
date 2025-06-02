const express = require("express");
const { adminLogin, getAllUsers, registerAdmin, getEventPrivileges,reset, resetPassword, assignPrivileges, getAllEvents, getRegField, getAvailableRoles,  deletePrivileges} = require("../controllers/authController"); // Ensure functions are correctly imported
const { authenticateAdmin } = require("../middleware/authMiddleware");
const {authenticatePrivilege} = require("../middleware/privilegeAuthMiddleware")

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

// Get all registered users (Admin only)
router.get("/users", authenticateAdmin, getAllUsers); // Ensure correct function reference

router.post("/register", registerAdmin);

router.get('/event-privileges', authenticatePrivilege, getEventPrivileges);

router.post('/assign-privileges', authenticatePrivilege, assignPrivileges);

router.get("/events", getAllEvents);

router.get("/event-reg",getRegField);

router.get("/event-roles/:EventId",getAvailableRoles);

router.delete("/delete-privileges/:eventId",deletePrivileges);

router.post('/reset-password-request',resetPassword)

router.post('/reset-password/:token',reset)




module.exports = router;
