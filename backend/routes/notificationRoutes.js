const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

// GET /api/notifications - Get all notifications for user
router.get('/', getUserNotifications);

// POST /api/notifications - Create notification (system use)
router.post('/', createNotification);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Mark specific notification as read
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', deleteNotification);

module.exports = router;
