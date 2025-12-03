const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.delete('/:id', bookingController.cancelBooking);

// Provider routes
router.get('/provider/bookings', bookingController.getProviderBookings);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
