const express = require('express');
const { createEvent, getEvents, getEventByDetails } = require("../controllers/eventController");
const router = express.Router();

// Create event requires JWT token for authentication
router.post('/create-event', createEvent);
router.get('/get-events', getEvents); 
router.get('/event/:companyName/:eventName', getEventByDetails);


module.exports = router;
