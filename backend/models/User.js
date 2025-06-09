const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  claim: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  companyName: { type: String, required: false },
  eventName: { type: String, required: false },
  role: { type: String, required: false },
  email: { type: String, required: true },
  privileges: [privilegeSchema],
  registrationData: { type: Object, required: false },
  qrCode: { type: String },
  transactionId: { type: String },
  paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'FREE REGISTRATION'], default: 'PENDING' }

}, {
  timestamps: true 
});

userSchema.index({ email: 1, eventId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
