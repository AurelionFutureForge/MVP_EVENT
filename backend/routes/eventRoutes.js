const express = require('express');
const { createEvent, getEvents } = require("../controllers/eventController");
const router = express.Router();

// Create event requires JWT token for authentication
router.post('/create-event', createEvent);
router.get('/get-events', getEvents); 


module.exports = router;
