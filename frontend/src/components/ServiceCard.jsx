import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../services/bookingAPI';

function ServiceCard({ service }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const rating = service.rating?.average || service.rating || 0;
  const reviewCount = service.rating?.count || service.reviewCount || 0;
  const providerName = service.provider?.businessName || service.providerName || 'Provider';
  const providerId = service.provider?._id || service.providerId || 'unknown';

  const handleBookNow = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!token || !user) {
      alert('Please login to book a service');
      navigate('/login');
      return;
    }

    // Check if user has selected a role
    if (!user.role) {
      alert('Please select your role first');
      navigate('/select-role');
      return;
    }

    // Customers can book, providers cannot
    if (user.role === 'provider') {
      alert('Providers cannot book services. Please login with a customer account.');
      return;
    }

    if (!service._id) {
      alert('Invalid service. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create booking with minimal data - backend will auto-generate missing fields
      const bookingData = {
        serviceId: service._id,
        customerNotes: `Booking for ${service.title || service.name}`
      };

      const response = await createBooking(bookingData);
      
      if (response.success || response.data) {
        alert('✅ Booking created successfully! Check your dashboard.');
        // Navigate to user dashboard where bookings are displayed
        navigate('/dashboard/user');
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create booking';
      setError(errorMsg);
      alert(`❌ ${errorMsg}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-item">
      <div className="service-item-header">
        <Link to={`/services/${service._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>{service.title}</h3>
        </Link>
        <div className="service-rating">
          <span className="rating-star">⭐</span>
          <span>{typeof rating === 'number' ? rating.toFixed(1) : '0.0'}</span>
          <span className="review-count">
            ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      <div className="service-item-body">
        <p className="service-description">
          {service.description?.substring(0, 150)}
          {service.description?.length > 150 ? '...' : ''}
        </p>

        <div className="service-provider">
          <span>by {providerName}</span>
        </div>

        <div className="service-meta">
          <span className="service-category">
            {service.category}
          </span>
          {service.location?.city && (
            <span className="service-location">
              📍 {service.location.city}, {service.location.state || ''}
            </span>
          )}
        </div>

        <div className="service-item-footer">
          <div className="service-price">
            <span className="price-amount">₹{service.price}</span>
            <span className="price-type">
              {service.priceType === 'hourly' ? '/hour' :
               service.priceType === 'per-visit' ? '/visit' :
               service.priceType === 'fixed' ? '' : ''}
            </span>
          </div>
          <button 
            onClick={handleBookNow}
            className="btn-view"
            disabled={loading}
            style={{ 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Booking...' : 'Book Now →'}
          </button>
        </div>
        {error && <div className="error-text" style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</div>}
      </div>
    </div>
  );
}

export default ServiceCard;
