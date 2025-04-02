const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  eventName: { type: String, required: true },
  companyName: { type: String, required: true },
  place: { type: String, required: true },
  time: { type: String, required: true }, // Kept as String assuming it's a specific time format
  date: { type: Date, required: true }, // Now properly stored as a Date object
  contact: { type: String, required: true, match: /^\d{10}$/ }, // Ensuring only 10-digit numbers
  role: { type: String, enum: ["Visitor", "Speaker"], default: "Visitor" },
  qrCode: { type: String, unique: true }, // Ensuring QR codes are unique
  hasEntered: { type: Boolean, default: false },
  hasClaimedLunch: { type: Boolean, default: false },
  hasClaimedGift: { type: Boolean, default: false },
}, { timestamps: true }); // Adds createdAt & updatedAt fields

module.exports = mongoose.model("User", userSchema);
