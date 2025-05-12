const Event = require('../models/Event');

// Create Event
const createEvent = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);
    const { companyName, eventName, eventRoles, place, time, startDate, endDate } = req.body;

    const trimmedCompanyName = companyName.trim();
    const trimmedEventName = eventName.trim();

    const existingEvent = await Event.findOne({
      companyName: { $regex: new RegExp(`^${trimmedCompanyName}$`, 'i') },
      eventName: { $regex: new RegExp(`^${trimmedEventName}$`, 'i') }
    });

    if (existingEvent) {
      return res.status(400).json({ msg: 'An event with this company and event name already exists' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and End date are required' });
    }

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);
    if (isNaN(formattedStartDate.getTime()) || isNaN(formattedEndDate.getTime())) { 
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    if (!Array.isArray(eventRoles) || eventRoles.length === 0) {
      return res.status(400).json({ msg: 'At least one role is required' });
    }

    const processedRoles = eventRoles.map(role => {
      let privilegesArray = [];

      if (Array.isArray(role.privileges)) {
        privilegesArray = role.privileges.flatMap(p => 
          p.split(',').map(item => item.trim()).filter(item => item)
        );
      }

      if (privilegesArray.length === 0) {
        throw new Error(`Role '${role.roleName}' must have at least one valid privilege`);
      }

      if (role.rolePrice === undefined || isNaN(Number(role.rolePrice)) || Number(role.rolePrice) < 0) {
        throw new Error(`Role '${role.roleName}' must have a valid non-negative price`);
      }

      if (role.maxRegistrations === undefined || isNaN(Number(role.maxRegistrations)) || Number(role.maxRegistrations) <= 0) {
        throw new Error(`Role '${role.roleName}' must have a valid positive maxRegistrations`);
      }

      return {
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: privilegesArray,
        rolePrice: Number(role.rolePrice),
        maxRegistrations: Number(role.maxRegistrations)
      };
    });

    const newEvent = new Event({
      companyName: trimmedCompanyName,
      eventName: trimmedEventName,
      eventRoles: processedRoles,
      place,
      time,
      startDate: formattedStartDate.toISOString(),
      endDate: formattedEndDate.toISOString()
    });

    await newEvent.save();
    res.status(201).json({ msg: 'Event created', event: newEvent });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Get all events of a company
const getEvents = async (req, res) => {
  const companyName = req.query.companyName?.trim();

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
    const trimmedCompanyName = companyName.trim();
    const trimmedEventName = eventName.trim();

    const event = await Event.findOne({
      companyName: { $regex: new RegExp(`^${trimmedCompanyName}$`, 'i') },
      eventName: { $regex: new RegExp(`^${trimmedEventName}$`, 'i') }
    });

    if (!event) {
      return res.status(404).json({ msg: 'Event not found!' });
    }

    res.json(event);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Edit event (fetch event by ID)
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
    const { companyName, eventName, eventRoles, place, time, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and End date are required' });
    }

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);
    if (isNaN(formattedStartDate.getTime()) || isNaN(formattedEndDate.getTime())) { 
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    if (!Array.isArray(eventRoles) || eventRoles.length === 0) {
      return res.status(400).json({ msg: 'At least one role is required' });
    }

    const processedRoles = eventRoles.map(role => {
      if (!role.roleName || typeof role.roleName !== 'string') {
        throw new Error('Each role must have a valid roleName');
      }
      if (!role.roleDescription || typeof role.roleDescription !== 'string') {
        throw new Error(`Role '${role.roleName}' must have a valid roleDescription`);
      }

      if (!Array.isArray(role.privileges) || role.privileges.length === 0) {
        throw new Error(`Role '${role.roleName}' must have at least one privilege`);
      }

      for (const privilege of role.privileges) {
        if (typeof privilege !== 'string' || !privilege.trim()) {
          throw new Error(`Role '${role.roleName}' has invalid privilege values`);
        }
      }

      if (role.rolePrice === undefined || isNaN(Number(role.rolePrice)) || Number(role.rolePrice) < 0) {
        throw new Error(`Role '${role.roleName}' must have a valid non-negative price`);
      }

      if (role.maxRegistrations === undefined || isNaN(Number(role.maxRegistrations)) || Number(role.maxRegistrations) <= 0) {
        throw new Error(`Role '${role.roleName}' must have a valid positive maxRegistrations`);
      }

      return {
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: role.privileges.map(p => p.trim()),
        rolePrice: Number(role.rolePrice),
        maxRegistrations: Number(role.maxRegistrations)
      };
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      {
        companyName: companyName.trim(),
        eventName: eventName.trim(),
        eventRoles: processedRoles,
        place,
        time,
        startDate: formattedStartDate.toISOString(),
        endDate: formattedEndDate.toISOString()
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

// Save registration fields for event
const saveRegistrationFields = async (req, res) => {
  const { EventId, registrationFields } = req.body;

  if (!EventId || !registrationFields || registrationFields.length === 0) {
    return res.status(400).json({ message: "Event ID and fields are required" });
  }

  try {
    const event = await Event.findById(EventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.registrationFields = registrationFields;
    await event.save();

    res.status(200).json({ 
      message: "Registration fields saved successfully!",
      eventId: event._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving registration fields" });
  }
};

// Get event by ID
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



module.exports = { 
  createEvent, 
  getEvents, 
  getEventByDetails, 
  EditEvents, 
  UpdateEvents, 
  saveRegistrationFields, 
  getEventById
};
