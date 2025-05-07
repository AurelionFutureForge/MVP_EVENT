const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Privilege = require('../models/privilegeModel');


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

const createPrivilege = async (req, res) => {
  const { companyName, eventName, roleName, privileges, email, password } = req.body;

  if (!companyName || !eventName || !roleName || !privileges.length || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newPrivilege = new Privilege({ companyName, eventName, roleName, privileges, email, password });
    await newPrivilege.save();

    res.status(201).json({ message: "Privilege created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while creating privilege" });
  }
};

// Assign privilege to users under the role
const assignPrivilegeToUsers = async (req, res) => {
  const { companyName, eventName, roleName, privileges } = req.body;

  if (!companyName || !eventName || !roleName || !privileges.length) {
    return res.status(400).json({ message: "Company, event, role and privileges are required" });
  }

  try {
    const users = await User.find({ companyName, eventName, role: roleName });

    for (let user of users) {
      const existing = user.privileges.map(p => p.privilegeName);
      const newPrivileges = privileges.filter(
        p => !existing.includes(p.privilegeName)
      );

      user.privileges.push(...newPrivileges);
      await user.save();
    }

    res.status(200).json({ message: "Privileges assigned to users successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while assigning privileges" });
  }
};

const getRoles = async (req, res) => {
  const adminCompanyName = req.admin.companyName;

  try {
    const events = await Event.find({ companyName: adminCompanyName });

    const rolesList = [];
    events.forEach(event => {
      event.eventRoles.forEach(roleObj => {
        rolesList.push(roleObj.roleName); // Only include roleName
      });
    });

    res.status(200).json(rolesList); // Send only role names
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles" });
  }
};



module.exports = { adminLogin, getAllUsers, registerAdmin, createPrivilege, assignPrivilegeToUsers, getRoles };
