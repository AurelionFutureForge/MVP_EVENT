require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({ email: "admin@example.com", password: hashedPassword });

    console.log("Admin user created successfully");
    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
