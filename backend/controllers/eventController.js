const Event = require('../models/Event');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Create Event
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createEvent = async (req, res) => {
  try {
    let { companyName, eventName, eventRoles, place, time, startDate, endDate } = req.body;

    console.log('Incoming Request:', req.body);
    console.log('File Upload:', req.file);

    const trimmedCompanyName = companyName.trim();
    const trimmedEventName = eventName.trim();

    // Parse eventRoles if it's a JSON string (multipart/form-data)
    if (typeof eventRoles === 'string') {
      try {
        eventRoles = JSON.parse(eventRoles);
      } catch (err) {
        return res.status(400).json({ msg: 'Invalid eventRoles format. Should be a valid JSON array.' });
      }
    }

    // Check for existing event
    const existingEvent = await Event.findOne({
      companyName: { $regex: new RegExp(`^${trimmedCompanyName}$`, 'i') },
      eventName: { $regex: new RegExp(`^${trimmedEventName}$`, 'i') }
    });

    if (existingEvent) {
      return res.status(400).json({ msg: 'An event with this company and event name already exists' });
    }

    // Validate startDate
    if (!startDate) {
      return res.status(400).json({ msg: 'Start date is required' });
    }
    const formattedStartDate = new Date(startDate);
    if (isNaN(formattedStartDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid start date format' });
    }

    let formattedEndDate = null;
    if (endDate) {
      formattedEndDate = new Date(endDate);
      if (isNaN(formattedEndDate.getTime())) {
        return res.status(400).json({ msg: 'Invalid end date format' });
      }
    }

    // Validate and process roles
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

      const rolePrice = role.rolePrice ?? role.price;
      if (rolePrice === undefined || isNaN(Number(rolePrice)) || Number(rolePrice) < 0) {
        throw new Error(`Role '${role.roleName}' must have a valid non-negative price`);
      }

      if (role.maxRegistrations === undefined || isNaN(Number(role.maxRegistrations)) || Number(role.maxRegistrations) <= 0) {
        throw new Error(`Role '${role.roleName}' must have a valid positive maxRegistrations`);
      }

      return {
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: privilegesArray,
        rolePrice: Number(rolePrice),
        maxRegistrations: Number(role.maxRegistrations)
      };
    });

    // Upload image to Cloudinary
    let companyPoster = null;
    if (req.file) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'event_posters' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const uploadResult = await streamUpload();
      companyPoster = uploadResult.secure_url; // Use this Cloudinary image URL
    }

    const newEvent = new Event({
      companyName: trimmedCompanyName,
      eventName: trimmedEventName,
      eventRoles: processedRoles,
      place,
      time,
      startDate: formattedStartDate.toISOString(),
      ...(formattedEndDate && { endDate: formattedEndDate.toISOString() }),
      companyPoster, // Cloudinary URL
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

    // Upload to Cloudinary if a new file is present
    let companyPoster = undefined;
    if (req.file) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'event_posters' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const uploadResult = await streamUpload();
      companyPoster = uploadResult.secure_url; // get Cloudinary URL
    }

    if (!startDate) {
      return res.status(400).json({ msg: 'Start date is required' });
    }

    const formattedStartDate = new Date(startDate);
    if (isNaN(formattedStartDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid start date format' });
    }

    let formattedEndDate = null;
    if (endDate) {
      formattedEndDate = new Date(endDate);
      if (isNaN(formattedEndDate.getTime())) {
        return res.status(400).json({ msg: 'Invalid end date format' });
      }
    }

    let parsedEventRoles = eventRoles;
    if (typeof eventRoles === 'string') {
      try {
        parsedEventRoles = JSON.parse(eventRoles);
      } catch {
        return res.status(400).json({ msg: 'Invalid eventRoles format. Must be JSON.' });
      }
    }

    if (!Array.isArray(parsedEventRoles) || parsedEventRoles.length === 0) {
      return res.status(400).json({ msg: 'At least one role is required' });
    }

    const processedRoles = parsedEventRoles.map(role => {
      if (!role.roleName || typeof role.roleName !== 'string') {
        throw new Error('Each role must have a valid roleName');
      }

      if (!role.roleDescription || typeof role.roleDescription !== 'string') {
        throw new Error(`Role '${role.roleName}' must have a valid roleDescription`);
      }

      const privilegesArray = Array.isArray(role.privileges)
        ? role.privileges.flatMap(p =>
            p.split(',').map(item => item.trim()).filter(Boolean)
          )
        : [];

      if (privilegesArray.length === 0) {
        throw new Error(`Role '${role.roleName}' must have at least one valid privilege`);
      }

      const rolePrice = role.rolePrice ?? role.price;
      if (rolePrice === undefined || isNaN(Number(rolePrice)) || Number(rolePrice) < 0) {
        throw new Error(`Role '${role.roleName}' must have a valid non-negative price`);
      }

      if (role.maxRegistrations === undefined || isNaN(Number(role.maxRegistrations)) || Number(role.maxRegistrations) <= 0) {
        throw new Error(`Role '${role.roleName}' must have a valid positive maxRegistrations`);
      }

      return {
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: privilegesArray,
        rolePrice: Number(rolePrice),
        maxRegistrations: Number(role.maxRegistrations)
      };
    });

    const updateFields = {
      companyName: companyName.trim(),
      eventName: eventName.trim(),
      eventRoles: processedRoles,
      place,
      time,
      startDate: formattedStartDate.toISOString(),
    };

    if (formattedEndDate) {
      updateFields.endDate = formattedEndDate.toISOString();
    }

    if (companyPoster) {
      updateFields.companyPoster = companyPoster; // use Cloudinary URL if new image uploaded
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ msg: "Event not found" });
    }

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
      eventId: event._id,
      eventName: event.eventName
    });

  } catch (error) {
  console.error("Error saving fields:", error);
  res.status(500).json({ 
    message: "Error saving registration fields",
    error: error.message  // this will help debug!
  });
}
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventID);
    console.log("ID", req.params.eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const toggleForm = async (req, res) => {
  const { EventId } = req.params;
  console.log("eventId",EventId);

  try {
    // Get current event
    const event = await Event.findById(EventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Ensure the field exists and toggle its value
    const updatedToggleForm = event.toggleForm !== undefined ? !event.toggleForm : true;

    // Update and save the document
    event.toggleForm = updatedToggleForm;
    await event.save();

    res.status(200).json({
      message: "Form status updated successfully",
      toggleForm: updatedToggleForm,
    });
  } catch (error) {
    console.error("Toggle form error:", error.message);
    res.status(500).json({ error: "Failed to update form status" });
  }
};

module.exports = { 
  createEvent, 
  getEvents, 
  getEventByDetails, 
  EditEvents, 
  UpdateEvents, 
  saveRegistrationFields, 
  getEventById,
  toggleForm
};
