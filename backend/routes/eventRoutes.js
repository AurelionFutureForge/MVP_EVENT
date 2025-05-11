const express = require('express');
const { createEvent, getEvents, getEventByDetails, EditEvents, UpdateEvents, saveRegistrationFields,getEventById, getAvailableRoles } = require("../controllers/eventController");
const router = express.Router();

// Create event requires JWT token for authentication
router.post('/create-event', createEvent);
router.get('/get-events', getEvents); 
router.get('/:companyName/:eventName', getEventByDetails);
router.get('/:eventId',EditEvents);
router.put('/:eventId',UpdateEvents);
router.post("/save-registration-fields", saveRegistrationFields);
router.get('/:eventId', getEventById);
router.get("/event-roles/:EventId",getAvailableRoles);


module.exports = router;
