const jwt = require("jsonwebtoken");

exports.authenticateAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  console.log("Received token:", token);  // Log the token for debugging

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = verified.adminId;  // Store directly as req.adminId
    next();
  } catch (err) {
    console.error("JWT verification error:", err); // Log the error for debugging
    res.status(403).json({ message: "Invalid Token" });
  }
};

