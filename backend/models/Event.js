const eventSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  eventName: { type: String, required: true },
  eventRoles: [{
    name: { type: String, required: true },
    privileges: {
      entry: { type: Boolean, default: true }, // entry is always true
      lunch: { type: Boolean, default: false },
      gift: { type: Boolean, default: false }
    }
  }],
  place: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
