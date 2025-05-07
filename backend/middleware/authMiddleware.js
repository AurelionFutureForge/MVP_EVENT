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

    // Store just adminId (keep your existing functionality safe)
    req.adminId = verified.adminId;

    // ALSO fetch the full admin document (so req.admin.companyName works)
    const admin = await Admin.findById(verified.adminId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;   // ✅ Now both req.adminId and req.admin are available

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(403).json({ message: "Invalid Token" });
  }
};
