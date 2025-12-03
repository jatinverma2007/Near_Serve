const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    // Build query
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const totalNotifications = await Notification.countDocuments(query);
    const totalPages = Math.ceil(totalNotifications / limit);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      totalNotifications,
      unreadCount,
      page,
      totalPages,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }

    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    // Update notification
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }

    // Find and check ownership
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    // Delete notification
    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// @desc    Create notification (system use)
// @route   POST /api/notifications
// @access  Private (Admin/System only - can be protected with admin middleware)
exports.createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      priority,
      actionUrl,
      imageUrl,
      data,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, type, title, and message are required'
      });
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Create notification
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      priority: priority || 'medium',
      actionUrl,
      imageUrl,
      data,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};
