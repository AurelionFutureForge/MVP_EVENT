const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  companyName: {
    type: String,
    required: true,
  },

  // 🔐 Add these for password reset
  resetToken: String,
  resetTokenExpiry: Date,
});

module.exports = mongoose.model("Admin", adminSchema);
