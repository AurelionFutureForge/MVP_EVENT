const Privilege = require("../models/privilegeModel"); // Your privilege collection
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event"); 

exports.privilegeLogin = async (req, res) => {
  const { email, password, companyName, eventName } = req.body;

  try {
    // Find the eventId from Event DB using companyName and eventName
    const eventDoc = await Event.findOne({ companyName, eventName });

    if (!eventDoc) {
      return res.status(404).json({ message: "Event not found for this company" });
    }

    const eventId = eventDoc._id.toString(); // Convert ObjectId to string (optional but clean)

    // Find the privilege document using companyName and eventName
    const privUserData = await Privilege.findOne({ companyName, eventName });

    if (!privUserData) {
      return res.status(404).json({ message: "Privileges not set for this event" });
    }

    // Find the user in the privileges array
    const privUser = privUserData.privileges.find(
      (priv) => priv.email === email
    );

    if (!privUser) {
      return res.status(400).json({ message: "Email not found" });
    }

    //  Check password
    if (privUser.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    //  Prepare token payload (now with eventId fetched from Event DB)
    const tokenPayload = {
      email: privUser.email,
      privilegeName: privUser.privilegeName,
      roleName: privUser.roleName,
      companyName,
      eventName,
      eventId,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "2h" });

    //  Return token + privilege info + eventId
    res.json({
      token,
      privilegeName: privUser.privilegeName,
      roleName: privUser.roleName,
      eventName,
      eventId,
      companyName,
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

