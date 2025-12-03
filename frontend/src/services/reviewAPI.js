import api from './api';

// Review API functions

/**
 * Create a new review for a completed booking
 * @param {Object} reviewData - Review information { bookingId, serviceId, rating, comment, images }
 * @returns {Promise} - Created review
 */
export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get reviews for a specific service
 * @param {String} serviceId - Service ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} - List of reviews with rating distribution
 */
export const getServiceReviews = async (serviceId, params = {}) => {
  try {
    const response = await api.get(`/services/${serviceId}/reviews`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single review by ID
 * @param {String} reviewId - Review ID
 * @returns {Promise} - Review details
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Submit a review with rating and comment
 * @param {String} bookingId - Booking ID
 * @param {String} serviceId - Service ID
 * @param {Number} rating - Rating (1-5)
 * @param {String} comment - Review comment
 * @param {Array} images - Optional array of image URLs
 * @returns {Promise} - Created review
 */
export const submitReview = async (bookingId, serviceId, rating, comment, images = []) => {
  try {
    const reviewData = {
      bookingId,
      serviceId,
      rating,
      comment,
      images
    };
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get reviews by user
 * @param {String} userId - User ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} - List of user's reviews
 */
export const getUserReviews = async (userId, params = {}) => {
  try {
    const response = await api.get(`/reviews/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get reviews for a provider
 * @param {String} providerId - Provider ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} - List of provider's reviews
 */
export const getProviderReviews = async (providerId, params = {}) => {
  try {
    const response = await api.get(`/reviews/provider/${providerId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get reviews by current logged-in user
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} - List of current user's reviews
 */
export const getMyReviews = async (params = {}) => {
  try {
    const response = await api.get('/reviews/my-reviews', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update an existing review
 * @param {String} reviewId - Review ID
 * @param {Object} updateData - Updated review data { rating, comment, images }
 * @returns {Promise} - Updated review
 */
export const updateReview = async (reviewId, updateData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a review
 * @param {String} reviewId - Review ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Check if user can review a booking
 * @param {String} bookingId - Booking ID
 * @returns {Promise} - Boolean indicating if review is allowed
 */
export const canReviewBooking = async (bookingId) => {
  try {
    const response = await api.get(`/reviews/can-review/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Calculate average rating for a service
 * @param {Array} reviews - Array of review objects
 * @returns {Number} - Average rating
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

/**
 * Get rating distribution for display
 * @param {Object} ratingDistribution - Rating distribution object from API
 * @returns {Array} - Array of rating counts [5-star, 4-star, 3-star, 2-star, 1-star]
 */
export const getRatingDistributionArray = (ratingDistribution) => {
  if (!ratingDistribution) return [0, 0, 0, 0, 0];
  return [
    ratingDistribution['5'] || 0,
    ratingDistribution['4'] || 0,
    ratingDistribution['3'] || 0,
    ratingDistribution['2'] || 0,
    ratingDistribution['1'] || 0
  ];
};

/**
 * Format review date
 * @param {String} dateString - ISO date string
 * @returns {String} - Formatted date
 */
export const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

export default {
  createReview,
  getServiceReviews,
  getReviewById,
  submitReview,
  getUserReviews,
  getProviderReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  canReviewBooking,
  calculateAverageRating,
  getRatingDistributionArray,
  formatReviewDate
};
