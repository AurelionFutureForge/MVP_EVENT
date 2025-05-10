const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Privilege = require('../models/privilegeModel');
const Event = require("../models/Event");


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
    const { eventName } = req.query; 

    const query = { companyName };

    if (eventName) {
      query.eventName = eventName; 
    }

    const users = await User.find(query, "-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users", error });
  }
};

// Controller function to get all events for the admin's company
const getAllEvents = async (req, res) => {
  try {
    const { companyName } = req.query;  // Get companyName from the query parameters

    // Fetch events for the given company name
    const events = await Event.find({ companyName });

    if (events.length === 0) {
      return res.status(404).json({ message: "No events found for this company" });
    }

    res.status(200).json(events);  // Return the list of events
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve events", error });
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
    res.status(201).json({ message: "Admin registered successfully", token, companyName :newAdmin.companyName, adminEmail:newAdmin.email });

  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

const getEventPrivileges = async (req, res) => {
  const { companyName } = req.query;

  if (!companyName) {
    return res.status(400).json({ message: "Company name is required" });
  }

  try {
    // Find the event by companyName
    const event = await Event.findOne({ companyName });

    if (!event) {
      return res.status(404).json({ message: "Event not found for this company" });
    }

    // Extract privileges from eventRoles
    const privileges = event.eventRoles.reduce((acc, role) => {
      acc.push(...role.privileges); // Add each role's privileges to the list
      return acc;
    }, []);

    res.json({ privileges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event privileges" });
  }
};

// Assign privileges to users
const assignPrivileges = async (req, res) => {
  const { companyName, privileges } = req.body;

  if (!companyName || !privileges || privileges.length === 0) {
    return res.status(400).json({ message: "Company and privileges are required" });
  }

  try {
    // Fetch the event by companyName to get the eventName
    const event = await Event.findOne({ companyName });

    if (!event) {
      return res.status(404).json({ message: "Event not found for this company" });
    }

    const eventName = event.eventName;

    // Check if the privileges document already exists for this company and event
    let existingPrivileges = await Privilege.findOne({ companyName, eventName });

    if (!existingPrivileges) {
      // If no existing privileges, create a new document
      existingPrivileges = new Privilege({
        companyName,
        eventName,
        privileges: [] // initialize an empty privileges array
      });
    }

    // Add new privileges to the existing privileges array
    for (const priv of privileges) {
      const { privilegeName, email, password } = priv;

      // Check if email and password exist for each privilege
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required for each privilege" });
      }

      // Check if the privilege already exists for this user (optional, to prevent duplicates)
      const existingPrivilege = existingPrivileges.privileges.find(
        (p) => p.email === email && p.privilegeName === privilegeName
      );

      if (existingPrivilege) {
        // Optionally, update the password if privilege already exists
        existingPrivilege.password = password;
      } else {
        // Add the new privilege
        existingPrivileges.privileges.push({ privilegeName, email, password });
      }
    }

    // Save the updated privileges document
    await existingPrivileges.save();

    res.status(200).json({ message: "Privileges assigned successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning privileges" });
  }
};





module.exports = { adminLogin, getAllUsers, registerAdmin, getEventPrivileges, assignPrivileges, getAllEvents};
