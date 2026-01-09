import React, { useState } from 'react';
import { createBooking } from '../services/bookingAPI';
import { useNavigate } from 'react-router-dom';

function BookingForm({ serviceId, servicePrice, servicePriceType, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    customerNotes: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      landmark: ''
    },
    contactPhone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.scheduledDate || !formData.scheduledTime) {
        setError('Please select date and time');
        setLoading(false);
        return;
      }

      if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
        setError('Please fill in complete address');
        setLoading(false);
        return;
      }

      if (!formData.contactPhone) {
        setError('Please provide contact phone number');
        setLoading(false);
        return;
      }

      const bookingData = {
        serviceId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        address: formData.address,
        contact: {
          phone: formData.contactPhone,
          alternatePhone: ''
        },
        customerNotes: formData.customerNotes
      };

      const data = await createBooking(bookingData);
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          navigate('/dashboard/user');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="booking-success">
        <div className="success-icon">✓</div>
        <h3>Booking Successful!</h3>
        <p>Your booking has been submitted. The provider will confirm shortly.</p>
        <p className="redirect-message">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      {error && (
        <div className="form-error">
          <p>{error}</p>
        </div>
      )}

      {/* Service Info Summary */}
      <div className="booking-summary">
        <div className="summary-item">
          <span className="label">Price:</span>
          <span className="value">₹{servicePrice} / {servicePriceType}</span>
        </div>
      </div>

      {/* Date and Time */}
      <div className="form-section">
        <h4>Schedule</h4>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduledDate">Date *</label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="scheduledTime">Time *</label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="form-section">
        <h4>Service Address</h4>
        <div className="form-group">
          <label htmlFor="street">Street Address *</label>
          <input
            type="text"
            id="street"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="123 Main Street"
            required
            className="form-input"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="San Francisco"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              type="text"
              id="state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="CA"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code *</label>
            <input
              type="text"
              id="zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              placeholder="94102"
              required
              className="form-input"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="landmark">Landmark (Optional)</label>
          <input
            type="text"
            id="landmark"
            name="address.landmark"
            value={formData.address.landmark}
            onChange={handleChange}
            placeholder="Near Central Park"
            className="form-input"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="form-section">
        <h4>Contact Information</h4>
        <div className="form-group">
          <label htmlFor="contactPhone">Phone Number *</label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            required
            className="form-input"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <h4>Additional Notes</h4>
        <div className="form-group">
          <label htmlFor="customerNotes">Special Instructions (Optional)</label>
          <textarea
            id="customerNotes"
            name="customerNotes"
            value={formData.customerNotes}
            onChange={handleChange}
            placeholder="Any special requirements or instructions..."
            rows="4"
            className="form-textarea"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn-submit"
        disabled={loading}
      >
        {loading ? 'Creating Booking...' : 'Confirm Booking'}
      </button>

      <p className="form-note">
        * Required fields. You will receive a confirmation once the provider accepts your booking.
      </p>
    </form>
  );
}

export default BookingForm;
