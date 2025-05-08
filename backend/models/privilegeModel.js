const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  privileges: [
    {
      privilegeName: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
      claim: { type: Boolean, default: false }  // Add claim flag (for scan feature)
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Privilege', privilegeSchema);
