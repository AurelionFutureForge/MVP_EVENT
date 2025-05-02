const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  companyName: {   //We directly store the company name here
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
