const express = require('express');
const { createEvent, getEvents, getEventByDetails, EditEvents, UpdateEvents, saveRegistrationFields,getEventById, toggleForm} = require("../controllers/eventController");
const upload = require('../uploadMiddleware')
const router = express.Router();

// Create event requires JWT token for authentication
router.post('/create-event',upload.single('companyPoster'), createEvent);
router.get('/get-events', getEvents); 
router.get('/edit/:eventId',EditEvents);
router.put('/:eventId',upload.single('poster'),UpdateEvents);
router.get('/:companyName/:eventName', getEventByDetails);
router.post("/save-registration-fields", saveRegistrationFields);
router.get('/:eventID', getEventById);
router.put('/toggle-form/:EventId',toggleForm);


module.exports = router;
