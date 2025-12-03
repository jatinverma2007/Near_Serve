const Review = require('../models/Review');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (User only)
exports.createReview = async (req, res) => {
  try {
    const { bookingId, serviceId, rating, comment, images } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!bookingId || !serviceId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, service ID, rating, and comment are required'
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID or service ID format'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if booking exists and belongs to the user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify the booking belongs to the user
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Verify the service matches the booking
    if (booking.serviceId.toString() !== serviceId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Service ID does not match the booking'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Get service to find providerId
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Create the review
    const review = await Review.create({
      serviceId,
      bookingId,
      userId,
      providerId: service.providerId,
      rating,
      comment,
      images: images || []
    });

    // Populate the review details
    await review.populate([
      { path: 'userId', select: 'name email' },
      { path: 'serviceId', select: 'title category' }
    ]);

    // Update service rating and review count
    await updateServiceRating(serviceId);

    // Update provider rating and review count
    await updateProviderRating(service.providerId);

    // Create notification for provider
    await Notification.create({
      userId: booking.providerId,
      type: 'review_received',
      title: 'New Review Received',
      message: `You received a ${rating}-star review from ${req.user.name}`,
      relatedId: review._id,
      relatedModel: 'Review'
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Get reviews for a specific service
// @route   GET /api/services/:id/reviews
// @access  Public
exports.getServiceReviews = async (req, res) => {
  try {
    const { id: serviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate service ID
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Get reviews with pagination
    const reviews = await Review.find({ serviceId })
      .populate('userId', 'name email')
      .populate('providerId', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({ serviceId });
    const totalPages = Math.ceil(totalReviews / limit);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Format rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalReviews,
      page,
      totalPages,
      averageRating: service.rating,
      ratingDistribution: distribution,
      reviews
    });
  } catch (error) {
    console.error('Error fetching service reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service reviews',
      error: error.message
    });
  }
};

// Helper function to update service rating
async function updateServiceRating(serviceId) {
  try {
    const result = await Review.aggregate([
      { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      const { averageRating, totalReviews } = result[0];
      await Service.findByIdAndUpdate(serviceId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
}

// Helper function to update provider rating
async function updateProviderRating(providerId) {
  try {
    const result = await Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      const { averageRating, totalReviews } = result[0];
      await Provider.findByIdAndUpdate(providerId, {
        'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        'rating.count': totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating provider rating:', error);
  }
}

// @desc    Get current user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const reviews = await Review.find({ userId })
      .populate('serviceId', 'title category')
      .populate('providerId', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({ userId });
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalReviews,
      page,
      totalPages,
      reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reviews',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (User who created the review)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate review ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
    }

    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the review belongs to the user
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(id);

    // Update service and provider ratings
    await updateServiceRating(review.serviceId);
    await updateProviderRating(review.providerId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};
