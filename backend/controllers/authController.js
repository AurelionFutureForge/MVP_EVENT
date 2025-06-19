const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Privilege = require('../models/privilegeModel');
const Event = require("../models/Event");
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "stagynio@gmail.com",
    pass: "tebj avtf jhrv mjec",
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


const getAllUsers = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Normalize company name
    const normalize = (str) => str.replace(/\s+/g, ' ').trim();
    const companyName = normalize(admin.companyName);
    console.log(companyName)

    const { eventId } = req.query;

    // Build query object
    const query = { companyName };
    if (eventId) {
      query.eventId = eventId;
    }
    console.log(query)

    const users = await User.find(query, "-password");

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to retrieve users", error });
  }
};




// Controller function to get all events for the admin's company
const getAllEvents = async (req, res) => {
  try {
    const raw = req.query.companyName || "";
    const cleanedName = decodeURIComponent(raw.replace(/\+/g, " ")).trim();

    const escaped = cleanedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const flexibleRegex = escaped.replace(/\s+/g, "\\s+");

    const events = await Event.find({
      companyName: { $regex: new RegExp(`^${flexibleRegex}$`, "i") }
    });

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
    let { email, password, companyName, location, category } = req.body;

    if (!email || !password || !companyName || !location || !category) {
      return res.status(400).json({ message: "Email, password, company name, location and category are required" });
    }

    // Normalize companyName: remove extra spaces
    const normalize = (str) => str.replace(/\s+/g, " ").trim();
    const normalizedCompanyName = normalize(companyName)

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const existingCompany = await Admin.findOne({ companyName: normalizedCompanyName });
    if (existingCompany) {
      return res.status(400).json({ message: "Company name already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      companyName: normalizedCompanyName,
      location,
      category,
    });

    await newAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: newAdmin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      companyName: newAdmin.companyName,
      adminEmail: newAdmin.email
    });

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

    const invalidPrivileges = [];

    for (const priv of privileges) {
      const { privilegeName, email, password, endDate } = priv;

      if (!email || !password || !endDate) {
        invalidPrivileges.push(priv);
        continue;
      }

      const existingPrivilege = existingPrivileges.privileges.find(
        (p) => p.email === email && p.privilegeName === privilegeName
      );

      if (existingPrivilege) {
        existingPrivilege.password = password;
        existingPrivilege.endDate = endDate;
      } else {
        existingPrivileges.privileges.push({ privilegeName, email, password, endDate });
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

    if (invalidPrivileges.length > 0) {
      return res.status(207).json({
        message: "Some privileges were assigned successfully, but some were skipped due to missing data.",
        skipped: invalidPrivileges
      });
    }

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


const deletePrivileges = async (req, res) => {
  let { eventId } = req.params;

  // Remove colon if accidentally included
  eventId = eventId.startsWith(':') ? eventId.slice(1) : eventId;

  // Validate eventId is a valid ObjectId string
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid eventId" });
  }

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

const resetPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Finding admin:", email);
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'User not found' });

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: {
          resetToken: token,
          resetTokenExpiry: Date.now() + 1000 * 60 * 30,
        },
      }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "stagynio@gmail.com",
        pass: "tebj avtf jhrv mjec",
      },
    });

    const resetLink = `https://aurelionfutureforge.com/stagyn/reset-password/${token}`;
    console.log("Sending reset link to:", admin.email);

    await transporter.sendMail({
      from: 'no-reply@yourapp.com',
      to: admin.email,
      subject: 'Password Reset',
      html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.status(200).json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    console.error('Reset password request error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }

}

const reset = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // 1. Find user by token and check expiry
    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() } // not expired
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Update password and clear reset fields
    admin.password = hashedPassword;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;

    await admin.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const getAdmin = async (req, res) => {
  try {
    // Step 1: Extract and decode company name from query
    const raw = req.query.companyName || "";
    const decoded = decodeURIComponent(raw.replace(/\+/g, ' ')).trim(); // Convert "+" to space and trim

    // Step 2: Escape regex special characters
    const escaped = decoded.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Step 3: Replace multiple spaces with \s+ to match any space count
    const flexiblePattern = escaped.replace(/\s+/g, '\\s+');
    const regex = new RegExp(`^${flexiblePattern}$`, 'i');

    console.log("Searching with regex:", regex);

    // Step 4: Perform regex-based search
    const admin = await Admin.findOne({
      companyName: { $regex: regex }
    });

    if (!admin) {
      return res.status(404).json({ message: "No admin registered with this company name" });
    }

    // Step 5: Return category
    res.json({ category: admin.category.trim() });

  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ message: "Server error while fetching admin" });
  }
};





module.exports = { adminLogin, getAdmin, getAllUsers, reset, resetPassword, registerAdmin, getEventPrivileges, assignPrivileges, getAllEvents, getRegField, getAvailableRoles, deletePrivileges };
