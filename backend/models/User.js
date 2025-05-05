const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    eventName: { type: String, required: true },
    companyName: { type: String, required: true },
    place: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    contact: { type: String, required: true },
    role: { type: String, required: true },
    qrCode: { type: String },
    hasEntered: { type: Boolean, default: false },

    // Optional fields — only added if privilege applies
    hasClaimedLunch: { type: Boolean, default: undefined },
    hasClaimedGift: { type: Boolean, default: undefined },
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
