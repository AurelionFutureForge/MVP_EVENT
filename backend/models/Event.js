// Event Model (Mongoose Schema)
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  eventRoles: { type: [String], required: true }, // Array of strings for roles
  place: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
