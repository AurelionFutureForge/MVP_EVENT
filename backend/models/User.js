const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  eventName: { type: String, required: true },
  companyName: { type: String, required: true },
  place: { type: String, required: true }, // It will come from the Event
  time: { type: String, required: true }, // Time for the event
  date: { type: String, required: true }, // Date of the event
  contact: { type: String, required: true, match: /^\d{10}$/ }, // 10-digit contact validation
  role: { type: String, required: true }, // Single role, can be adjusted if multiple roles are needed
  qrCode: { type: String, unique: true }, // QR code link, must be unique for each user
  hasEntered: { type: Boolean, default: false }, // Flag for entry
  hasClaimedLunch: { type: Boolean, default: false }, // Flag for lunch claim
  hasClaimedGift: { type: Boolean, default: false }, // Flag for gift claim
}, { timestamps: true }); // Automatically adds createdAt & updatedAt fields

module.exports = mongoose.model("User", userSchema);
