const Privilege = require("../models/privilegeModel"); // Your privilege collection
const jwt = require("jsonwebtoken");

exports.privilegeLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const privUser = await Privilege.findOne({ email });
    if (!privUser) return res.status(400).json({ message: "Email not found" });

    if (privUser.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ email: privUser.email, privilegeName: privUser.privilegeName }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ token, privilegeName: privUser.privilegeName });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
