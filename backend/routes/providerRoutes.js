const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const authMiddleware = require('../middleware/auth');

// Protected routes (require authentication)
// Create provider profile
router.post('/', authMiddleware, providerController.createProviderProfile);

router.get('/me', authMiddleware, providerController.getMyProviderProfile);
router.get('/profile', authMiddleware, providerController.getProviderProfile);
router.put('/profile', authMiddleware, providerController.updateProviderProfile);
router.get('/services', authMiddleware, providerController.getProviderServices);

// Advanced Availability System Routes
// Get provider availability
router.get('/:id/availability', providerController.getProviderAvailability);

// Update full availability (protected)
router.put('/:id/availability', authMiddleware, providerController.updateProviderAvailability);

// Add a time slot (protected)
router.post('/:id/availability/slot', authMiddleware, providerController.addAvailabilitySlot);

// Delete a time slot (protected)
router.delete('/:id/availability/slot/:slotId', authMiddleware, providerController.deleteAvailabilitySlot);

// Add a holiday (protected)
router.post('/:id/availability/holiday', authMiddleware, providerController.addHoliday);

// Delete a holiday (protected)
router.delete('/:id/availability/holiday/:holidayId', authMiddleware, providerController.deleteHoliday);

// Add a break (protected)
router.post('/:id/availability/break', authMiddleware, providerController.addBreak);

// Delete a break (protected)
router.delete('/:id/availability/break/:breakId', authMiddleware, providerController.deleteBreak);

module.exports = router;
