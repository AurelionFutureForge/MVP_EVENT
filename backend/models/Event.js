const mongoose = require('mongoose');

// Role Schema with Privileges
const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  roleDescription: { type: String, required: true },
  privileges: [{ type: String, required: true }]   
});

// Registration Field Schema
const registrationFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, required: true, enum: ['text', 'email', 'number', 'select', 'checkbox', 'date'] },
  options: { type: [String], default: [] },  // For fields like 'select' or 'checkbox', options will be an array
  required: { type: Boolean, default: false }
});

// Event Schema
const eventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  eventRoles: [roleSchema],       // Array of roles with descriptions + privileges
  place: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
  registrationFields: [registrationFieldSchema]  // Array of dynamically added registration fields
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
