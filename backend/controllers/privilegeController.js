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

    // Include eventId + companyName in token to scope properly
    const tokenPayload = {
      email: privUser.email,
      privilegeName: privUser.privilegeName,
      roleName: privUser.roleName,   // (optional: remove if you don't use it later)
      companyName: privUserData.companyName,
      eventName: privUserData.eventName,
      eventId: privUserData.eventId,   // <== **This is what we’ll use later for safer queries**
    };

    // Generate a JWT token if the credentials are valid
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Send back the token + privilege info
    res.json({
      token,
      privilegeName: privUser.privilegeName,
      roleName: privUser.roleName,
      eventName: privUserData.eventName,
      eventId: privUserData.eventId,
      companyName: privUserData.companyName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getPrivilegeUsers = async (req, res) => {
  const { email, privilegeName } = req.user;
  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  try {
    // Find privilege document containing this email
    const privilegeDoc = await Privilege.findOne({
      "privileges.email": email,
    });

    if (!privilegeDoc) {
      return res.status(404).json({ message: "Privilege not found." });
    }

    const { companyName } = privilegeDoc;

    // Fetch users who belong to same company, same eventId, and have privilegeName
    const users = await User.find({
      companyName,
      eventId,
      "privileges.name": privilegeName,
    });

    res.json({ users });
  } catch (err) {
    console.error("Error fetching privilege users:", err);
    res.status(500).json({ message: "Server error while fetching privilege users." });
  }
};

