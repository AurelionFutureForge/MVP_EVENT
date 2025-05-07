const Privilege = require("../models/privilegeModel"); // Your privilege collection
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.privilegeLogin = async (req, res) => {
  const { email, password, companyName, eventName } = req.body;

  try {
    // Find the privilege document for the given companyName and eventName
    const privUserData = await Privilege.findOne({ companyName, eventName });

    if (!privUserData) {
      return res.status(404).json({ message: "Event or company not found" });
    }

    // Find the user in the privileges array
    const privUser = privUserData.privileges.find(
      (priv) => priv.email === email
    );

    if (!privUser) {
      return res.status(400).json({ message: "Email not found" });
    }

    // Check if the password matches (plain text comparison)
    if (privUser.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate a JWT token if the credentials are valid
    const token = jwt.sign(
      { email: privUser.email, privilegeName: privUser.privilegeName, roleName: privUser.roleName },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Send back the token and privilegeName
    res.json({
      token,
      privilegeName: privUser.privilegeName,
      roleName: privUser.roleName,
      privileges: privUserData.privileges, // You can also send back other data if needed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPrivilegeUsers = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized. Token missing." });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { email, privilegeName } = decoded;
  
      // Find privilege document containing this email inside privileges array
      const privilegeDoc = await Privilege.findOne({ "privileges.email": email });
      if (!privilegeDoc) return res.status(404).json({ message: "Privilege not found." });
  
      const { companyName, eventName } = privilegeDoc;
  
      // Fetch users who belong to same companyName + eventName + role (role === privilegeName)
      const users = await User.find({
        companyName,
        eventName,
        role: privilegeName
      });
  
      res.json({ users });
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: "Invalid or expired token." });
    }
  };