const Event = require('../models/Event');

const createEvent = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);
    const { companyName, eventName, eventRoles, place, time, date } = req.body;

    const trimmedCompanyName = companyName.trim();
    const trimmedEventName = eventName.trim();

    const existingEvent = await Event.findOne({
      companyName: { $regex: new RegExp(`^${trimmedCompanyName}$`, 'i') },
      eventName: { $regex: new RegExp(`^${trimmedEventName}$`, 'i') }
    });

    if (existingEvent) {
      return res.status(400).json({ msg: 'An event with this company and event name already exists' });
    }

    if (!date) {
      return res.status(400).json({ msg: 'Date is required' });
    }

    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) { 
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    if (!Array.isArray(eventRoles) || eventRoles.length === 0) {
      return res.status(400).json({ msg: 'At least one role is required' });
    }

    const processedRoles = eventRoles.map(role => {
      // Process privileges safely (whether it is ["entry", "lunch"] or ["entry,lunch"])
      let privilegesArray = [];

      if (Array.isArray(role.privileges)) {
        privilegesArray = role.privileges.flatMap(p => 
          p.split(',').map(item => item.trim()).filter(item => item)  // Split + trim + remove empty
        );
      }

      if (privilegesArray.length === 0) {
        throw new Error(`Role '${role.roleName}' must have at least one valid privilege`);
      }

      return {
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: privilegesArray
      };
    });

    const newEvent = new Event({
      companyName: trimmedCompanyName,
      eventName: trimmedEventName,
      eventRoles: processedRoles,
      place, 
      time, 
      date: formattedDate.toISOString().split("T")[0]
    });

    await newEvent.save();
    res.status(201).json({ msg: 'Event created', event: newEvent });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};



const getEvents = async (req, res) => {
  const companyName = req.query.companyName?.trim(); // get from query param, trim to avoid extra spaces

  if (!companyName) {
    return res.status(400).json({ msg: 'Company name is required' });
  }

  try {
    const events = await Event.find({ companyName });
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

const EditEvents = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Update event
const UpdateEvents = async (req, res) => {
  try {
    const { companyName, eventName, eventRoles, place, time, date } = req.body;

    // Validate fields like in createEvent
    if (!date) {
      return res.status(400).json({ msg: 'Date is required' });
    }
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) { 
      return res.status(400).json({ msg: 'Invalid date format' });
    }

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

      if (!Array.isArray(role.privileges) || role.privileges.length === 0) {
        return res.status(400).json({ msg: `Role '${role.roleName}' must have at least one privilege` });
      }

      for (const privilege of role.privileges) {
        if (typeof privilege !== 'string' || !privilege.trim()) {
          return res.status(400).json({ msg: `Role '${role.roleName}' has invalid privilege values` });
        }
      }
    }

    // Clean the data
    const trimmedCompanyName = companyName.trim();
    const trimmedEventName = eventName.trim();
    const processedRoles = eventRoles.map(role => ({
      roleName: role.roleName.trim(),
      roleDescription: role.roleDescription.trim(),
      privileges: role.privileges.map(p => p.trim())
    }));

    // Perform the update safely
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      {
        companyName: trimmedCompanyName,
        eventName: trimmedEventName,
        eventRoles: processedRoles,
        place,
        time,
        date: formattedDate.toISOString().split("T")[0]
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) return res.status(404).json({ msg: "Event not found" });
    res.json(updatedEvent);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Failed to update event", error: err.message });
  }
};

const saveRegistrationFields = async (req, res) => {
  const { EventId, registrationFields } = req.body;

  if (!EventId || !registrationFields || registrationFields.length === 0) {
    return res.status(400).json({ message: "Event ID and fields are required" });
  }

  try {
    // Find the event by eventId
    const event = await Event.findById(EventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Save the registration fields to the event
    event.registrationFields = registrationFields;
    await event.save();

    res.status(200).json({ 
      message: "Registration fields saved successfully!",
      eventId: event._id   // still sending eventId in response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving registration fields" });
  }
};


const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createEvent, getEvents, getEventByDetails, EditEvents, UpdateEvents, saveRegistrationFields, getEventById };
