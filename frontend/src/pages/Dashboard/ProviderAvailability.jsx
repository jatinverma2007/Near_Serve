import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as availabilityAPI from '../../services/availabilityAPI';
import { getMyProviderProfile } from '../../services/providerAPI';
import '../../styles.css';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ProviderAvailability = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Provider ID
  const [providerId, setProviderId] = useState(null);
  
  // Availability data
  const [isAvailable, setIsAvailable] = useState(true);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [breaks, setBreaks] = useState([]);
  
  // Modal states
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  
  // Form states
  const [selectedDay, setSelectedDay] = useState('monday');
  const [slotStart, setSlotStart] = useState('09:00');
  const [slotEnd, setSlotEnd] = useState('17:00');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');
  const [breakDate, setBreakDate] = useState('');
  const [breakStart, setBreakStart] = useState('12:00');
  const [breakEnd, setBreakEnd] = useState('13:00');
  const [breakReason, setBreakReason] = useState('');

  useEffect(() => {
    fetchProviderIdAndAvailability();
  }, []);

  const fetchProviderIdAndAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, get the provider profile to get the provider ID
      const profileResponse = await getMyProviderProfile();
      
      if (profileResponse.success && profileResponse.provider) {
        const id = profileResponse.provider._id;
        setProviderId(id);
        
        // Now fetch availability data
        const availabilityResponse = await availabilityAPI.getProviderAvailability(id);
        
        if (availabilityResponse.success) {
          setIsAvailable(availabilityResponse.data.isAvailable);
          setWeeklyAvailability(availabilityResponse.data.weeklyAvailability || []);
          setHolidays(availabilityResponse.data.holidays || []);
          setBreaks(availabilityResponse.data.breaks || []);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load availability settings. Please make sure you have a provider profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!providerId) return;
    
    try {
      setSaving(true);
      setError('');
      
      const response = await availabilityAPI.updateProviderAvailability(providerId, {
        isAvailable: !isAvailable
      });
      
      if (response.success) {
        setIsAvailable(!isAvailable);
        setSuccess('Availability status updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    
    if (slotStart >= slotEnd) {
      setError('End time must be after start time');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!providerId) {
      setError('Provider ID not found');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const response = await availabilityAPI.addAvailabilitySlot(providerId, {
        day: selectedDay,
        start: slotStart,
        end: slotEnd
      });
      
      if (response.success) {
        setWeeklyAvailability(response.data.weeklyAvailability);
        setShowSlotModal(false);
        setSuccess('Time slot added successfully');
        setTimeout(() => setSuccess(''), 3000);
        // Reset form
        setSelectedDay('monday');
        setSlotStart('09:00');
        setSlotEnd('17:00');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add time slot');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (day, slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    
    if (!providerId) return;
    
    try {
      setSaving(true);
      setError('');
      
      const response = await availabilityAPI.deleteAvailabilitySlot(providerId, slotId, day);
      
      if (response.success) {
        setWeeklyAvailability(response.data.weeklyAvailability);
        setSuccess('Time slot deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete time slot');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    
    if (!holidayDate || !holidayReason) {
      setError('Date and reason are required');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!providerId) {
      setError('Provider ID not found');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const response = await availabilityAPI.addHoliday(providerId, {
        date: holidayDate,
        reason: holidayReason
      });
      
      if (response.success) {
        setHolidays(response.data.holidays);
        setShowHolidayModal(false);
        setSuccess('Holiday added successfully');
        setTimeout(() => setSuccess(''), 3000);
        // Reset form
        setHolidayDate('');
        setHolidayReason('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    
    if (!providerId) return;
    
    try {
      setSaving(true);
      setError('');
      
      const response = await availabilityAPI.deleteHoliday(providerId, holidayId);
      
      if (response.success) {
        setHolidays(response.data.holidays);
        setSuccess('Holiday deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete holiday');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBreak = async (e) => {
    e.preventDefault();
    
    if (!breakDate) {
      setError('Date is required');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (breakStart >= breakEnd) {
      setError('End time must be after start time');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!providerId) {
      setError('Provider ID not found');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const response = await availabilityAPI.addBreak(providerId, {
        date: breakDate,
        start: breakStart,
        end: breakEnd,
        reason: breakReason || undefined
      });
      
      if (response.success) {
        setBreaks(response.data.breaks);
        setShowBreakModal(false);
        setSuccess('Break added successfully');
        setTimeout(() => setSuccess(''), 3000);
        // Reset form
        setBreakDate('');
        setBreakStart('12:00');
        setBreakEnd('13:00');
        setBreakReason('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add break');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBreak = async (breakId) => {
    if (!window.confirm('Are you sure you want to delete this break?')) return;
    
    if (!providerId) return;
    
    try {
      setSaving(true);
      setError('');
      
      const response = await availabilityAPI.deleteBreak(providerId, breakId);
      
      if (response.success) {
        setBreaks(response.data.breaks);
        setSuccess('Break deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete break');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get slots for a specific day
  const getDaySlots = (day) => {
    const dayEntry = weeklyAvailability.find(entry => entry.day === day);
    return dayEntry ? dayEntry.slots : [];
  };

  if (loading) {
    return (
      <div className="provider-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading availability settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Availability Management</h1>
          <p className="dashboard-subtitle">Manage your working hours, holidays, and breaks</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/dashboard/provider')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {/* Availability Toggle */}
      <div className="availability-section">
        <div className="availability-toggle">
          <span className="toggle-label">Accept New Bookings:</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={isAvailable} 
              onChange={handleToggleAvailability}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
          <span style={{ fontWeight: 600, color: isAvailable ? '#10b981' : '#ef4444' }}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="availability-section">
        <div className="section-header">
          <h2>Weekly Schedule</h2>
          <button 
            onClick={() => setShowSlotModal(true)} 
            className="btn-primary"
            disabled={saving}
          >
            + Add Time Slot
          </button>
        </div>
        
        <div className="weekly-schedule">
          {DAYS_OF_WEEK.map(day => {
            const slots = getDaySlots(day);
            return (
              <div key={day} className="day-schedule">
                <div className="day-header">
                  <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                  {slots.length === 0 && (
                    <span className="status-badge status-unavailable">Unavailable</span>
                  )}
                </div>
                <div className="day-slots">
                  {slots.length > 0 ? (
                    slots.map(slot => (
                      <div key={slot._id} className="time-slot">
                        <span className="slot-time">{slot.start} - {slot.end}</span>
                        <button 
                          onClick={() => handleDeleteSlot(day, slot._id)}
                          className="btn-icon btn-delete-small"
                          disabled={saving}
                          title="Delete slot"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-slots">No time slots</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holidays */}
      <div className="availability-section">
        <div className="section-header">
          <h2>Holidays</h2>
          <button 
            onClick={() => setShowHolidayModal(true)} 
            className="btn-primary"
            disabled={saving}
          >
            + Add Holiday
          </button>
        </div>
        
        <div className="holidays-list">
          {holidays.length > 0 ? (
            <div className="holidays-grid">
              {holidays.map(holiday => (
                <div key={holiday._id} className="holiday-card">
                  <div className="holiday-info">
                    <div className="holiday-date">{new Date(holiday.date).toLocaleDateString()}</div>
                    <div className="holiday-reason">{holiday.reason}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteHoliday(holiday._id)}
                    className="btn-icon btn-delete-small"
                    disabled={saving}
                    title="Delete holiday"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No holidays added</div>
          )}
        </div>
      </div>

      {/* Breaks */}
      <div className="availability-section">
        <div className="section-header">
          <h2>Scheduled Breaks</h2>
          <button 
            onClick={() => setShowBreakModal(true)} 
            className="btn-primary"
            disabled={saving}
          >
            + Add Break
          </button>
        </div>
        
        <div className="breaks-list">
          {breaks.length > 0 ? (
            <div className="breaks-grid">
              {breaks.map(brk => (
                <div key={brk._id} className="break-card">
                  <div className="break-info">
                    <div className="break-date">{new Date(brk.date).toLocaleDateString()}</div>
                    <div className="break-time">{brk.start} - {brk.end}</div>
                    {brk.reason && <div className="break-reason">{brk.reason}</div>}
                  </div>
                  <button 
                    onClick={() => handleDeleteBreak(brk._id)}
                    className="btn-icon btn-delete-small"
                    disabled={saving}
                    title="Delete break"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No breaks scheduled</div>
          )}
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showSlotModal && (
        <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Time Slot</h3>
              <button onClick={() => setShowSlotModal(false)} className="close-button">×</button>
            </div>
            <form onSubmit={handleAddSlot} className="modal-form">
              <div className="form-group">
                <label>Day of Week</label>
                <select 
                  value={selectedDay} 
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="form-input"
                  required
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowSlotModal(false)} 
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Holiday Modal */}
      {showHolidayModal && (
        <div className="modal-overlay" onClick={() => setShowHolidayModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Holiday</h3>
              <button onClick={() => setShowHolidayModal(false)} className="close-button">×</button>
            </div>
            <form onSubmit={handleAddHoliday} className="modal-form">
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Reason</label>
                <input 
                  type="text" 
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Christmas, Personal Day"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowHolidayModal(false)} 
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Break Modal */}
      {showBreakModal && (
        <div className="modal-overlay" onClick={() => setShowBreakModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Break</h3>
              <button onClick={() => setShowBreakModal(false)} className="close-button">×</button>
            </div>
            <form onSubmit={handleAddBreak} className="modal-form">
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={breakDate}
                  onChange={(e) => setBreakDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason (Optional)</label>
                <input 
                  type="text" 
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Lunch, Meeting"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowBreakModal(false)} 
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Break'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderAvailability;
