import api from './api';

// Booking API functions

/**
 * Create a new booking
 * @param {Object} bookingData - Booking information
 * @returns {Promise} - Created booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all bookings for authenticated user
 * @param {Object} params - Query parameters (status, page, limit)
 * @returns {Promise} - List of user's bookings
 */
export const getUserBookings = async (params = {}) => {
  try {
    const response = await api.get('/bookings', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get bookings for provider (Provider only)
 * @param {Object} params - Query parameters (status, page, limit)
 * @returns {Promise} - List of provider's bookings with stats
 */
export const getProviderBookings = async (params = {}) => {
  try {
    const response = await api.get('/bookings/provider/bookings', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single booking by ID
 * @param {String} bookingId - Booking ID
 * @returns {Promise} - Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update booking status (Provider only)
 * @param {String} bookingId - Booking ID
 * @param {Object} statusData - Status update data { status, providerNotes }
 * @returns {Promise} - Updated booking
 */
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Cancel a booking (User)
 * @param {String} bookingId - Booking ID
 * @param {String} cancellationReason - Reason for cancellation
 * @returns {Promise} - Cancellation confirmation
 */
export const cancelBooking = async (bookingId, cancellationReason) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`, {
      data: { cancellationReason }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Confirm a booking (Provider)
 * @param {String} bookingId - Booking ID
 * @param {String} providerNotes - Optional notes from provider
 * @returns {Promise} - Updated booking
 */
export const confirmBooking = async (bookingId, providerNotes = '') => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, {
      status: 'confirmed',
      providerNotes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Reject a booking (Provider)
 * @param {String} bookingId - Booking ID
 * @param {String} providerNotes - Reason for rejection
 * @returns {Promise} - Updated booking
 */
export const rejectBooking = async (bookingId, providerNotes = '') => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, {
      status: 'rejected',
      providerNotes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Mark booking as in-progress (Provider)
 * @param {String} bookingId - Booking ID
 * @param {String} providerNotes - Optional notes
 * @returns {Promise} - Updated booking
 */
export const startBooking = async (bookingId, providerNotes = '') => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, {
      status: 'in-progress',
      providerNotes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Mark booking as completed (Provider)
 * @param {String} bookingId - Booking ID
 * @param {String} providerNotes - Optional completion notes
 * @returns {Promise} - Updated booking
 */
export const completeBooking = async (bookingId, providerNotes = '') => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, {
      status: 'completed',
      providerNotes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get bookings by status
 * @param {String} status - Booking status
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - Filtered bookings
 */
export const getBookingsByStatus = async (status, params = {}) => {
  try {
    const response = await api.get('/bookings', {
      params: { status, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  createBooking,
  getUserBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  confirmBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  getBookingsByStatus
};
