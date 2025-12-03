const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: [
        'booking_created',
        'booking_confirmed',
        'booking_cancelled',
        'booking_completed',
        'booking_rejected',
        'review_received',
        'payment_received',
        'payment_pending',
        'message_received',
        'profile_updated',
        'service_approved',
        'service_rejected',
        'system_alert',
        'promotional'
      ],
      message: '{VALUE} is not a valid notification type'
    }
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can reference different models (Booking, Service, Review, etc.)
  },
  relatedModel: {
    type: String,
    enum: ['Booking', 'Service', 'Review', 'Provider', 'User', null],
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionUrl: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    // Additional data specific to notification type
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark multiple notifications as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
