const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  eventName: { type: String, required: true },
  companyName: { type: String, required: true },
  place: { type: String, required: true },
  time: { type: String, required: true }, // Can be stored as a string or Date
  date: { type: Date, required: true }, // Changed from String to Date
  contact: { type: String, required: true, match: /^\d{10}$/ }, // Validating 10-digit phone numbers
  role: { type: String, enum: ["Visitor", "Speaker"], default: "Visitor" },
  qrCode: { type: String, unique: true }, // Ensure QR generation prevents duplicates
  hasEntered: { type: Boolean, default: false },
  hasClaimedLunch: { type: Boolean, default: false },
  hasClaimedGift: { type: Boolean, default: false },
}, { timestamps: true }); // Automatically adds createdAt & updatedAt fields

module.exports = mongoose.model("User", userSchema);
