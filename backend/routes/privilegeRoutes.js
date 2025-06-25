const express = require("express");
const router = express.Router();

const { privilegeLogin,getPrivilegeUsers,Privilege,deletePrivilege } = require("../controllers/privilegeController");
const { authenticatePrivilege } = require("../middleware/privilegeAuthMiddleware");


// Public route
router.post("/login", privilegeLogin);
router.get("/users", authenticatePrivilege, getPrivilegeUsers);
router.get('/get-privileges/:eventId',Privilege);
router.delete('/delete-privilege',deletePrivilege);

module.exports = router;
