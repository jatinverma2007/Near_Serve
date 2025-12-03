// Helper utility functions
// Common utility functions used across the application

const helpers = {
  // Calculate distance between two coordinates
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    // TODO: Implement haversine formula
    return 0;
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },

  // Generate random ID
  generateId: () => {
    return Math.random().toString(36).substring(2, 15);
  },

  // Validate email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Sanitize input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  },
};

module.exports = helpers;
