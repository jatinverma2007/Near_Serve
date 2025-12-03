const express = require('express');
const router = express.Router();
const { createReview, getMyReviews, deleteReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// POST /api/reviews - Create a new review (protected)
router.post('/', authMiddleware, createReview);

// GET /api/reviews/my-reviews - Get current user's reviews (protected)
router.get('/my-reviews', authMiddleware, getMyReviews);

// DELETE /api/reviews/:id - Delete a review (protected)
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
