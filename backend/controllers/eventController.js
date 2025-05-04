const Event = require('../models/Event');

// Create a new event
const createEvent = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);
    const { companyName, eventName, eventRoles, place, time, date } = req.body;

    if (!date) {
      return res.status(400).json({ msg: 'Date is required' });
    }

    // Convert the date to a proper Date object
    const formattedDate = new Date(date);
    
    // Validate if it's a valid date
    if (isNaN(formattedDate.getTime())) { 
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    // Validate eventRoles structure
    if (!Array.isArray(eventRoles) || eventRoles.length === 0) {
      return res.status(400).json({ msg: 'At least one role is required' });
    }

    for (const role of eventRoles) {
      if (!role.name || typeof role.lunch !== 'boolean' || typeof role.gift !== 'boolean') {
        return res.status(400).json({ msg: 'Each role must have name, lunch, and gift as booleans' });
      }
    }

    // Map eventRoles to include privileges with entry=true always
    const processedRoles = eventRoles.map(role => ({
      name: role.name,
      privileges: {
        entry: true,            // Always true
        lunch: !!role.lunch,    // Ensure boolean
        gift: !!role.gift
      }
    }));

    const newEvent = new Event({ 
      companyName, 
      eventName, 
      eventRoles: processedRoles, // ✅ Corrected here
      place, 
      time, 
      date: formattedDate.toISOString().split("T")[0] // Save only YYYY-MM-DD
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
