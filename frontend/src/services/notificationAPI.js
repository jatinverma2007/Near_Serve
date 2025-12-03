import api from './api';

// Notification API functions

/**
 * Get all notifications for authenticated user
 * @param {Object} params - Query parameters (page, limit, unreadOnly)
 * @returns {Promise} - List of notifications with unread count
 */
export const getUserNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get unread notification count
 * @returns {Promise} - Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Mark a specific notification as read
 * @param {String} notificationId - Notification ID
 * @returns {Promise} - Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise} - Update confirmation with count
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a notification
 * @param {String} notificationId - Notification ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create a notification (system use)
 * @param {Object} notificationData - Notification data
 * @returns {Promise} - Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get unread notifications only
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} - List of unread notifications
 */
export const getUnreadNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', {
      params: { unreadOnly: true, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get notifications by type
 * @param {String} type - Notification type
 * @param {Object} params - Query parameters
 * @returns {Promise} - Filtered notifications
 */
export const getNotificationsByType = async (type, params = {}) => {
  try {
    const response = await api.get('/notifications', {
      params: { type, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Format notification time
 * @param {String} dateString - ISO date string
 * @returns {String} - Formatted time string
 */
export const formatNotificationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Get notification icon based on type
 * @param {String} type - Notification type
 * @returns {String} - Emoji icon
 */
export const getNotificationIcon = (type) => {
  const icons = {
    booking_created: '📅',
    booking_confirmed: '✅',
    booking_cancelled: '❌',
    booking_completed: '✔️',
    booking_rejected: '🚫',
    review_received: '⭐',
    payment_received: '💰',
    payment_pending: '⏳',
    message_received: '💬',
    profile_updated: '👤',
    service_approved: '✅',
    service_rejected: '❌',
    system_alert: '⚠️',
    promotional: '🎉'
  };
  return icons[type] || '🔔';
};

/**
 * Get notification priority color
 * @param {String} priority - Priority level
 * @returns {String} - Color class or hex
 */
export const getNotificationPriorityColor = (priority) => {
  const colors = {
    low: '#9CA3AF',
    medium: '#3B82F6',
    high: '#F59E0B',
    urgent: '#EF4444'
  };
  return colors[priority] || colors.medium;
};

/**
 * Group notifications by date
 * @param {Array} notifications - Array of notifications
 * @returns {Object} - Grouped notifications { today: [], yesterday: [], earlier: [] }
 */
export const groupNotificationsByDate = (notifications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {
    today: [],
    yesterday: [],
    earlier: []
  };

  notifications.forEach(notification => {
    const notifDate = new Date(notification.createdAt);
    notifDate.setHours(0, 0, 0, 0);

    if (notifDate.getTime() === today.getTime()) {
      groups.today.push(notification);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groups.yesterday.push(notification);
    } else {
      groups.earlier.push(notification);
    }
  });

  return groups;
};

/**
 * Poll for new notifications
 * @param {Function} callback - Callback function to handle new notifications
 * @param {Number} interval - Polling interval in milliseconds (default: 30000)
 * @returns {Number} - Interval ID for clearing
 */
export const pollNotifications = (callback, interval = 30000) => {
  return setInterval(async () => {
    try {
      const data = await getUnreadCount();
      if (callback) callback(data);
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }, interval);
};

export default {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadNotifications,
  getNotificationsByType,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationPriorityColor,
  groupNotificationsByDate,
  pollNotifications
};
