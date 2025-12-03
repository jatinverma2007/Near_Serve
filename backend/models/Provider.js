const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  businessName: {
    type: String,
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  profileImage: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    trim: true
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    }
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
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  categories: [{
    type: String,
    enum: ['plumber', 'electrician', 'mechanic', 'carpenter', 'painter', 'cleaner', 'gardener', 'other']
  }],
  experience: {
    years: {
      type: Number,
      min: 0,
      max: 50
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Experience description cannot be more than 500 characters']
    }
  },
  certifications: [{
    name: {
      type: String,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    },
    image: {
      type: String,
      trim: true
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  stats: {
    totalBookings: {
      type: Number,
      default: 0,
      min: 0
    },
    completedBookings: {
      type: Number,
      default: 0,
      min: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    }
  },
  // Advanced Availability System
  weeklyAvailability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    slots: [{
      start: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
      },
      end: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      }
    }]
  }],
  breaks: [{
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
    },
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 200
    },
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    }
  }],
  holidays: [{
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    }
  }],
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date
    },
    documents: [{
      type: {
        type: String,
        enum: ['id', 'license', 'insurance', 'other']
      },
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedAt: {
    type: Date
  },
  suspensionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
providerSchema.index({ userId: 1 }, { unique: true });
providerSchema.index({ 'address.city': 1, categories: 1 });
providerSchema.index({ 'rating.average': -1 });
providerSchema.index({ isActive: 1, isSuspended: 1 });

module.exports = mongoose.model('Provider', providerSchema);
