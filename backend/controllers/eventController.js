const Event = require('../models/Event');

// Create a new event
const createEvent = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body); // Log request data
    const { companyName, eventName, place, time, date } = req.body;

    if (!date) {
      return res.status(400).json({ msg: 'Date is required' });
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];
    
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    const newEvent = new Event({ 
      companyName, 
      eventName, 
      place, 
      time, 
      date: formattedDate 
    });

    await newEvent.save();
    res.status(201).json({ msg: 'Event created', event: newEvent });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
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
