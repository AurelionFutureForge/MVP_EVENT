const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");  

exports.authenticateAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  console.log("Received token:", token);

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(verified.adminId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;   

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(403).json({ message: "Invalid Token" });
  }
};
