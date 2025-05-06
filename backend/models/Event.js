const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  claimable: { type: Boolean, required: true }
});

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  privileges: [privilegeSchema]   // An array of dynamic privileges
});

const eventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  eventRoles: [roleSchema],       // Array of roles
  place: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
