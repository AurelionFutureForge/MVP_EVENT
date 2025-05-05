const jwt = require("jsonwebtoken");

exports.authenticateAdmin = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header("Authorization")?.split(" ")[1];
  
  // If no token is provided, send a 401 Unauthorized response
  if (!token) return res.status(401).json({ message: "Access Denied: No token provided" });

  console.log("Received token:", token);  // Log the token for debugging

  try {
    // Verify the token using JWT_SECRET
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Store the adminId from the token payload
    req.adminId = verified.adminId;  // Attach the adminId to the request object

    // Move to the next middleware or route handler
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);  // Log the error message
    return res.status(403).json({ message: "Invalid Token" });
  }
};
