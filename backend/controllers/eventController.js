const Event = require('../models/Event');

const createEvent = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);
    const { companyName, eventName, eventRoles, place, time, date } = req.body;

    // Trim spaces from companyName and eventName to avoid trailing spaces
    const trimmedCompanyName = companyName.trim();
    const trimmedEventName = eventName.trim();

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
      if (!role.roleName || typeof role.roleName !== 'string') {
        return res.status(400).json({ msg: 'Each role must have a valid roleName' });
      }
      if (!role.roleDescription || typeof role.roleDescription !== 'string') {
        return res.status(400).json({ msg: `Role '${role.roleName}' must have a valid roleDescription` });
      }
    }

    const processedRoles = eventRoles.map(role => ({
      roleName: role.roleName.trim(),
      roleDescription: role.roleDescription.trim()  // Now handling roleDescription
    }));

    const newEvent = new Event({
      companyName: trimmedCompanyName,
      eventName: trimmedEventName,
      eventRoles: processedRoles,
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

// Get event by company name and event name
const getEventByDetails = async (req, res) => {
  try {
    const { companyName, eventName } = req.params;
    console.log("Received Company Name:", companyName);  // Log received companyName
    console.log("Received Event Name:", eventName);  // Log received eventName

    // Trim spaces from the received params to avoid trailing spaces
    const trimmedCompanyName = companyName.trim();
    const trimmedEventName = eventName.trim();

    // Perform the query to find the event
    const event = await Event.findOne({
      companyName: { $regex: new RegExp(`^${trimmedCompanyName}$`, 'i') },  // Case-insensitive search
      eventName: { $regex: new RegExp(`^${trimmedEventName}$`, 'i') }       // Case-insensitive search
    });

    // Debug the found event
    if (event) {
      console.log("Event found:", event);  // Log the found event
    } else {
      console.log("No event found matching the criteria.");
    }

    if (!event) {
      return res.status(404).json({ msg: 'Event not found!' });
    }

    // Return the event details if found
    res.json(event);  // Respond with event details
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventByDetails };
