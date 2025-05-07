const express = require("express");
const router = express.Router();

const { privilegeLogin,getPrivilegeUsers } = require("../controllers/privilegeController");
const { authenticatePrivilege } = require("../middleware/privilegeAuthMiddleware");


// Public route
router.post("/login", privilegeLogin);
router.get("/users", authenticatePrivilege, getPrivilegeUsers);

module.exports = router;
