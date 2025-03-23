const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  eventName: String,
  contact: String,
  role: { type: String, enum: ["Visitor", "Speaker"], default: "Visitor" },
  qrCode: String,
  hasEntered: { type: Boolean, default: false },
  hasClaimedLunch: { type: Boolean, default: false },
  hasClaimedGift: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
