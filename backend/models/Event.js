const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  place: { type: String, required: true },
  time: { type: String, required: true }, // Can be stored as string or Date (if full datetime)
  date: { type: Date, required: true }, // Changed from String to Date
});

module.exports = mongoose.model("Event", eventSchema);
