const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Provider ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  providerResponse: {
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot be more than 500 characters']
    },
    respondedAt: {
      type: Date
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per booking
reviewSchema.index({ bookingId: 1 }, { unique: true });
reviewSchema.index({ serviceId: 1, rating: -1 });
reviewSchema.index({ providerId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
