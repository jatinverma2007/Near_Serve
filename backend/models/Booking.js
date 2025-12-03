const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
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
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  customerNotes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
    trim: true
  },
  providerNotes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    }
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
