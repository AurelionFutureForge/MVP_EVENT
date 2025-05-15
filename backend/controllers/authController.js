const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Privilege = require('../models/privilegeModel');
const Event = require("../models/Event");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "amthemithun@gmail.com",
    pass: "ptfk ykpn uygd yodb",
  }
});


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
    const { eventId } = req.query; // Fetch eventId from query params

    const query = { companyName };

    if (eventId) {
      query.eventId = eventId; // Match users by eventId now
    }

    const users = await User.find(query, "-password");

    res.status(200).json({ users }); // wrap in { users } to match frontend usage
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
    res.status(201).json({ message: "Admin registered successfully", token, companyName: newAdmin.companyName, adminEmail: newAdmin.email });

  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

//  GET privileges (updated to take eventId)
const getEventPrivileges = async (req, res) => {
  const { eventId } = req.query;
  console.log("eventID:", eventId);

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  try {
    // Find the event by eventId
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Extract privileges from eventRoles
    const privileges = event.eventRoles.reduce((acc, role) => {
      acc.push(...role.privileges);
      return acc;
    }, []);

    res.json({ privileges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event privileges" });
  }
};

//  ASSIGN privileges (updated to store with eventId)
const assignPrivileges = async (req, res) => {
  const { eventId, privileges } = req.body;

  if (!eventId || !privileges || privileges.length === 0) {
    return res.status(400).json({ message: "Event ID and privileges are required" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventName = event.eventName;
    const companyName = event.companyName;

    let existingPrivileges = await Privilege.findOne({ eventId });
    if (!existingPrivileges) {
      existingPrivileges = new Privilege({
        companyName,
        eventId,
        eventName,
        privileges: []
      });
    }

    for (const priv of privileges) {
      const { privilegeName, email, password } = priv;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required for each privilege" });
      }

      const existingPrivilege = existingPrivileges.privileges.find(
        (p) => p.email === email && p.privilegeName === privilegeName
      );

      if (existingPrivilege) {
        existingPrivilege.password = password;
      } else {
        existingPrivileges.privileges.push({ privilegeName, email, password });
      }

      // Send confirmation email
      const mailOptions = {
        from: '"Event Admin" <amthemithun@gmail.com>',
        to: email,
        subject: `Access Granted: ${privilegeName} Privilege for ${eventName}`,
        text: `Hi,\n\nYou have been assigned the "${privilegeName}" Privilege for the event "${eventName}".\n\nYour login credentials are:\nEmail: ${email}\nPassword: ${password}\n\nPlease keep them secure.\n\nBest regards,\n${companyName} Team`
      };

      await transporter.sendMail(mailOptions);
    }

    await existingPrivileges.save();

    res.status(200).json({ message: "Privileges assigned and emails sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning privileges" });
  }
};

const getRegField = async (req, res) => {
  try {
    const { eventId } = req.query; // Correct the query extraction

    // Find the event by its ID
    const event = await Event.findOne({ _id: eventId });

    // If no event is found, return a 404 error
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Log the event to verify if registrationFields are populated
    console.log('Fetched Event:', event);

    // Extract registration fields from the event
    const { registrationFields } = event;

    // Send back the registration fields
    res.status(200).json({ registrationFields }); // Send registrationFields explicitly
  } catch (err) {
    // Handle any other errors
    res.status(500).json({ error: err.message });
  }
};


const getAvailableRoles = async (req, res) => {
  try {
    const { EventId } = req.params;
    console.log(EventId);
    const event = await Event.findById(EventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const roles = event.eventRoles.map(role => role.roleName);
    res.json({ roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const deleteForm = async (req, res) => {
  const { EventId } = req.params;

  try {
    const event = await Event.findById(EventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.registrationFields = [];
    await event.save();

    res.json({ message: "Registration fields deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deletePrivileges = async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await Privilege.deleteMany({ eventId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No privileges found for the given eventId." });
    }

    return res.status(200).json({ message: `Deleted ${result.deletedCount} privilege(s).` });
  } catch (error) {
    console.error("Error deleting privileges:", error);
    return res.status(500).json({ message: "Server error while deleting privileges." });
  }
};


module.exports = { adminLogin, getAllUsers, registerAdmin, getEventPrivileges, assignPrivileges, getAllEvents, getRegField, getAvailableRoles, deleteForm, deletePrivileges};
