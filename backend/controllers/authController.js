const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Privilege = require('../models/Privilege');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login function
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      admin: { 
        id: admin._id, 
        email: admin.email, 
        companyName: admin.companyName   // Directly send company name
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all registered users (for admin)
const getAllUsers = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const companyName = admin.companyName;

    // Fetch users ONLY under this company name
    const users = await User.find({ companyName }, "-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users", error });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    if (!email || !password || !companyName) {
      return res.status(400).json({ message: "Email, password, and company name are required" });
    }

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      companyName,
    });

    await newAdmin.save();

    // Generate JWT token after successful registration
    const token = jwt.sign(
      { adminId: newAdmin._id }, // Payload
      process.env.JWT_SECRET, // Secret key
      { expiresIn: '1d' } // Set token expiration time (1 day)
    );

    // Send back the token and success message
    res.status(201).json({ message: "Admin registered successfully", token });

  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

const manageAccess = async (req, res) => {
  const { email, password, role, privileges, companyName, eventName } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email, companyName });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists under this company." });
    }

    // Fetch the privileges for the role
    const rolePrivileges = await Privilege.findOne({ eventName, companyName, role });
    if (!rolePrivileges) {
      return res.status(404).json({ message: "No privileges found for this role." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      companyName,
      eventName,
      privileges: privileges.map((privilege) => ({
        privilegeName: privilege,
        claimed: false,
      })),
    });

    await newUser.save();

    res.status(201).json({ message: "User access granted successfully!", user: newUser });
  } catch (error) {
    console.error("Error managing access:", error);
    res.status(500).json({ message: "Error managing access.", error: error.message });
  }
};

// adminController.js (add this to your admin controller)
const getAccessGrants = async (req, res) => {
  const { companyName } = req.params;

  try {
    // Get users belonging to this company
    const users = await User.find({ companyName });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching access grants:", error);
    res.status(500).json({ message: "Error fetching access grants.", error: error.message });
  }
};


// adminController.js
const revokeAccess = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.remove();
    res.status(200).json({ message: "Access revoked successfully!" });
  } catch (error) {
    console.error("Error revoking access:", error);
    res.status(500).json({ message: "Error revoking access.", error: error.message });
  }
};


module.exports = { adminLogin, getAllUsers, registerAdmin, manageAccess, getAccessGrants, revokeAccess};
