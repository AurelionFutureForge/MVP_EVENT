const jwt = require("jsonwebtoken");

exports.authenticatePrivilege = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.privilege = verified;   // { email, privilegeName }

    next();
  } catch (err) {
    console.error("Privilege JWT verification error:", err.message);
    return res.status(403).json({ message: "Invalid Token" });
  }
};
