// models/RegisteredUser.js
const mongoose = require('mongoose');

const registeredUserSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  privileges: [{ type: String }],  // Copied from role in EventDB

  // Store all dynamic fields as a key-value object
  registrationData: { type: Map, of: String }
});

const RegisteredUser = mongoose.model('RegisteredUser', registeredUserSchema);
module.exports = RegisteredUser;
