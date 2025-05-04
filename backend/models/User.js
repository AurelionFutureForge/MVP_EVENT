const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    eventName: { type: String, required: true },
    companyName: { type: String, required: true },
    place: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    contact: { type: String, required: true },
    role: { type: String, required: true },
    qrCode: { type: String },
  },
  {
    strict: false, // allows adding dynamic fields (like hasEntered, hasClaimedLunch, etc.)
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
