const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    eventName: { type: String, required: true },
    companyName: { type: String, required: true },
    place: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: Date, required: true },  // Use Date type
    contact: { type: String, required: true },
    role: { type: String, required: true },
    qrCode: { type: String },

    // Privileges array with default []
    privileges: {
      type: [
        {
          privilegeName: { type: String, required: true },
          claim: { type: Boolean, default: false }
        }
      ],
      default: []
    }
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
