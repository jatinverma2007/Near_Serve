import api from './api';

// Get provider availability
export const getProviderAvailability = async (providerId) => {
  const response = await api.get(`/providers/${providerId}/availability`);
  return response.data;
};

// Update full provider availability
export const updateProviderAvailability = async (providerId, data) => {
  const response = await api.put(`/providers/${providerId}/availability`, data);
  return response.data;
};

// Add a time slot
export const addAvailabilitySlot = async (providerId, slotData) => {
  const response = await api.post(`/providers/${providerId}/availability/slot`, slotData);
  return response.data;
};

// Delete a time slot
export const deleteAvailabilitySlot = async (providerId, slotId, day) => {
  const response = await api.delete(`/providers/${providerId}/availability/slot/${slotId}`, {
    data: { day }
  });
  return response.data;
};

// Add a holiday
export const addHoliday = async (providerId, holidayData) => {
  const response = await api.post(`/providers/${providerId}/availability/holiday`, holidayData);
  return response.data;
};

// Delete a holiday
export const deleteHoliday = async (providerId, holidayId) => {
  const response = await api.delete(`/providers/${providerId}/availability/holiday/${holidayId}`);
  return response.data;
};

// Add a break
export const addBreak = async (providerId, breakData) => {
  const response = await api.post(`/providers/${providerId}/availability/break`, breakData);
  return response.data;
};

// Delete a break
export const deleteBreak = async (providerId, breakId) => {
  const response = await api.delete(`/providers/${providerId}/availability/break/${breakId}`);
  return response.data;
};

export default {
  getProviderAvailability,
  updateProviderAvailability,
  addAvailabilitySlot,
  deleteAvailabilitySlot,
  addHoliday,
  deleteHoliday,
  addBreak,
  deleteBreak
};
