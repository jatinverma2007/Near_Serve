import api from './api';

// Provider API functions

/**
 * Get provider profile by ID
 * @param {String} providerId - Provider ID
 * @returns {Promise} - Provider profile
 */
export const getProviderById = async (providerId) => {
  try {
    const response = await api.get(`/providers/${providerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all providers with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise} - List of providers
 */
export const getAllProviders = async (params = {}) => {
  try {
    const response = await api.get('/providers', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get provider profile for authenticated user
 * @returns {Promise} - Current user's provider profile
 */
export const getMyProviderProfile = async () => {
  try {
    const response = await api.get('/providers/me');
    return {
      success: response.data.success,
      provider: response.data.data
    };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create a new provider profile
 * @param {Object} providerData - Provider information
 * @returns {Promise} - Created provider profile
 */
export const createProviderProfile = async (providerData) => {
  try {
    const response = await api.post('/providers', providerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update provider profile
 * @param {String} providerId - Provider ID
 * @param {Object} providerData - Updated provider information
 * @returns {Promise} - Updated provider profile
 */
export const updateProviderProfile = async (providerId, providerData) => {
  try {
    const response = await api.put(`/providers/${providerId}`, providerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete provider profile
 * @param {String} providerId - Provider ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteProviderProfile = async (providerId) => {
  try {
    const response = await api.delete(`/providers/${providerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get provider statistics
 * @param {String} providerId - Provider ID
 * @returns {Promise} - Provider stats (bookings, ratings, etc.)
 */
export const getProviderStats = async (providerId) => {
  try {
    const response = await api.get(`/providers/${providerId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get providers by category
 * @param {String} category - Category name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - Filtered providers
 */
export const getProvidersByCategory = async (category, params = {}) => {
  try {
    const response = await api.get('/providers', {
      params: { category, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get providers by city
 * @param {String} city - City name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - Filtered providers
 */
export const getProvidersByCity = async (city, params = {}) => {
  try {
    const response = await api.get('/providers', {
      params: { city, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update provider availability
 * @param {String} providerId - Provider ID
 * @param {Object} availabilityData - Availability schedule
 * @returns {Promise} - Updated provider
 */
export const updateProviderAvailability = async (providerId, availabilityData) => {
  try {
    const response = await api.put(`/providers/${providerId}/availability`, availabilityData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get provider's services
 * @param {String} providerId - Provider ID (optional, if not provided uses authenticated user)
 * @param {Object} params - Query parameters
 * @returns {Promise} - List of provider's services
 */
export const getProviderServices = async (providerId, params = {}) => {
  try {
    let url;
    if (providerId) {
      url = `/providers/${providerId}/services`;
    } else {
      // For authenticated provider, use the services endpoint directly
      url = '/providers/services';
    }
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get provider's reviews
 * @param {String} providerId - Provider ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} - List of provider's reviews
 */
export const getProviderReviews = async (providerId, params = {}) => {
  try {
    const response = await api.get(`/providers/${providerId}/reviews`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Check if user has a provider profile
 * @returns {Promise} - Boolean indicating if provider profile exists
 */
export const hasProviderProfile = async () => {
  try {
    const response = await api.get('/providers/check');
    return response.data;
  } catch (error) {
    // If 404, provider profile doesn't exist
    if (error.response?.status === 404) {
      return { exists: false };
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Format provider rating display
 * @param {Object} rating - Rating object { average, count }
 * @returns {String} - Formatted rating string
 */
export const formatProviderRating = (rating) => {
  if (!rating || !rating.count) return 'No ratings yet';
  return `${rating.average.toFixed(1)} (${rating.count} review${rating.count !== 1 ? 's' : ''})`;
};

/**
 * Calculate provider completion rate
 * @param {Object} stats - Provider stats object
 * @returns {Number} - Completion rate percentage
 */
export const calculateCompletionRate = (stats) => {
  if (!stats || !stats.totalBookings || stats.totalBookings === 0) return 0;
  return Math.round((stats.completedBookings / stats.totalBookings) * 100);
};

/**
 * Check if provider is verified
 * @param {Object} provider - Provider object
 * @returns {Boolean} - Verification status
 */
export const isProviderVerified = (provider) => {
  return provider?.verification?.isVerified || false;
};

/**
 * Get provider availability for a specific day
 * @param {Object} provider - Provider object
 * @param {String} day - Day of week (lowercase)
 * @returns {Object} - Availability { start, end } or null
 */
export const getProviderAvailabilityForDay = (provider, day) => {
  if (!provider?.availability?.schedule?.[day]) return null;
  return provider.availability.schedule[day];
};

export default {
  getProviderById,
  getAllProviders,
  getMyProviderProfile,
  createProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
  getProviderStats,
  getProvidersByCategory,
  getProvidersByCity,
  updateProviderAvailability,
  getProviderServices,
  getProviderReviews,
  hasProviderProfile,
  formatProviderRating,
  calculateCompletionRate,
  isProviderVerified,
  getProviderAvailabilityForDay
};
