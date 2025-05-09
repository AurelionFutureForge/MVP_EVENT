const jwt = require("jsonwebtoken");

exports.authenticatePrivilege = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Accept either token shape
    if (!verified.adminId && !(verified.email && verified.privilegeName)) {
      return res.status(400).json({ message: "Invalid token data" });
    }

    req.user = verified; // Store full token payload

    next();
  } catch (err) {
    console.error("Privilege JWT verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid or tampered token" });
  }
};
