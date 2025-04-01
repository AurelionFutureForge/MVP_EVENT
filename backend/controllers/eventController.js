const Event = require('../models/Event');

// Create a new event
const createEvent = async (req, res) => {
  const { companyName, eventName, place, time } = req.body;

  try {
    const newEvent = new Event({
      companyName,
      eventName,
      place,
      time,
    });

    await newEvent.save();
    res.status(201).json({ msg: 'Event created', event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { createEvent, getEvents };
