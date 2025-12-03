const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { getServiceReviews } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/search', serviceController.searchServices);
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.get('/:id/reviews', getServiceReviews);

// Protected routes (require authentication - provider only)
router.post('/', authMiddleware, serviceController.createService);
router.put('/:id', authMiddleware, serviceController.updateService);
router.delete('/:id', authMiddleware, serviceController.deleteService);

module.exports = router;
