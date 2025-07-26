const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// Route for flight search
router.get('/search', flightController.searchFlights);
router.post('/search', flightController.searchFlights);

// Route for enhanced flight details
router.post('/details', flightController.getFlightDetails);

// Route for generating booking links
router.get('/booking-link', flightController.generateBookingLink);

module.exports = router;
