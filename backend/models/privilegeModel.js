const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  roleName: { type: String, required: true },
  privileges: [
    {
      privilegeName: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Privilege', privilegeSchema);
;
