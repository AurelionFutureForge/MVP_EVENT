const Event = require('../models/Event');

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { companyName, eventName, place, time, date } = req.body;

    // Convert date string to a Date object
    const formattedDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    const newEvent = new Event({ companyName, eventName, place, time, date: formattedDate });

    await newEvent.save();
    res.status(201).json({ msg: 'Event created', event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

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
