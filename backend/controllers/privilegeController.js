const Privilege = require("../models/privilegeModel"); // Your privilege collection
const jwt = require("jsonwebtoken");

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
