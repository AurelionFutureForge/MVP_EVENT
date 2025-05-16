const Privilege = require("../models/privilegeModel"); // Your privilege collection
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event"); 

exports.privilegeLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the Privilege document that contains this email & password in privileges array
    // Using MongoDB query to find embedded document with matching email and password
    const privDoc = await Privilege.findOne({
      "privileges.email": email,
      "privileges.password": password
    });

    if (!privDoc) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Find the specific privilege object inside privileges array
    const privUser = privDoc.privileges.find(
      (priv) => priv.email === email && priv.password === password
    );

    if (!privUser) {
      // Should not happen if above findOne succeeded, but just in case
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Prepare token payload
    const tokenPayload = {
      email: privUser.email,
      privilegeName: privUser.privilegeName,
      companyName: privDoc.companyName,
      eventName: privDoc.eventName,
      eventId: privDoc.eventId.toString(),
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Return token + privilege info + event info
    res.json({
      token,
      privilegeName: privUser.privilegeName,
      companyName: privDoc.companyName,
      eventName: privDoc.eventName,
      eventId: privDoc.eventId,
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

