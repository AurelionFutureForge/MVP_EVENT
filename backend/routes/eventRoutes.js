const express = require('express');
const { createEvent, getEvents, getEventByDetails, EditEvents, UpdateEvents, saveRegistrationFields,getEventById} = require("../controllers/eventController");
const upload = require('../uploads/uploadMiddleware')
const router = express.Router();

// Create event requires JWT token for authentication
router.post('/create-event',upload.single('companyPoster'), createEvent);
router.get('/get-events', getEvents); 
router.get('/:companyName/:eventName', getEventByDetails);
router.get('/:eventId',EditEvents);
router.put('/:eventId',UpdateEvents);
router.post("/save-registration-fields", saveRegistrationFields);
router.get('/:eventId', getEventById);




module.exports = router;
