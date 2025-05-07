// privilegeModel.js
const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  privileges: [{
    name: { type: String, required: true },  // E.g., 'Lunch', 'Gift'
    description: { type: String },  // Optional, detailed description of the privilege
  }],
}, { timestamps: true });

module.exports = mongoose.model('Privilege', privilegeSchema);
