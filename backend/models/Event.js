const mongoose = require('mongoose');

// Updated Role Schema without Privileges
const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  roleDescription: { type: String, required: true }   // New roleDescription
});

// Event Schema
const eventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  eventRoles: [roleSchema],       // Array of roles with descriptions
  place: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
