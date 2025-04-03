const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  place: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true }, // Date field is properly defined
});

module.exports = mongoose.model("Event", eventSchema);
