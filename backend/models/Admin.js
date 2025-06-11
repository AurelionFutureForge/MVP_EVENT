const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  companyName: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiry: Date,
});

module.exports = mongoose.model("Admin", adminSchema);
