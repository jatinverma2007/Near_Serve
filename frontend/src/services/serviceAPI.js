import api from './api';

// Service API functions

/**
 * Get all services with optional filters
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - List of services
 */
export const getAllServices = async (params = {}) => {
  try {
    const response = await api.get('/services', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Search services with comprehensive filters
 * @param {Object} params - Search parameters
 * @param {String} params.query - Search query text
 * @param {String} params.category - Service category
 * @param {String} params.city - City name
 * @param {Number} params.minPrice - Minimum price
 * @param {Number} params.maxPrice - Maximum price
 * @param {Number} params.rating - Minimum rating
 * @returns {Promise} - Search results
 */
export const searchServices = async (params = {}) => {
  try {
    // Build query parameters
    const queryParams = {};
    
    if (params.query) queryParams.search = params.query;
    if (params.category) queryParams.category = params.category;
    if (params.city) queryParams.city = params.city;
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
    if (params.rating) queryParams.minRating = params.rating;
    
    const response = await api.get('/services', { params: queryParams });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single service by ID
 * @param {String} serviceId - Service ID
 * @returns {Promise} - Service details
 */
export const getServiceById = async (serviceId) => {
  try {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create a new service (Provider only)
 * @param {Object} serviceData - Service information
 * @returns {Promise} - Created service
 */
export const createService = async (serviceData) => {
  try {
    const response = await api.post('/services', serviceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update an existing service (Provider only)
 * @param {String} serviceId - Service ID
 * @param {Object} serviceData - Updated service information
 * @returns {Promise} - Updated service
 */
export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await api.put(`/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a service (Provider only)
 * @param {String} serviceId - Service ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteService = async (serviceId) => {
  try {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get reviews for a specific service
 * @param {String} serviceId - Service ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} - List of reviews
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
 * Filter services by category
 * @param {String} category - Category name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - Filtered services
 */
export const getServicesByCategory = async (category, params = {}) => {
  try {
    const response = await api.get('/services', {
      params: { category, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Filter services by city
 * @param {String} city - City name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - Filtered services
 */
export const getServicesByCity = async (city, params = {}) => {
  try {
    const response = await api.get('/services', {
      params: { city, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get services by provider ID
 * @param {String} providerId - Provider ID
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - Provider's services
 */
export const getServicesByProvider = async (providerId, params = {}) => {
  try {
    const response = await api.get('/services', {
      params: { providerId, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getAllServices,
  searchServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceReviews,
  getServicesByCategory,
  getServicesByCity,
  getServicesByProvider
};
