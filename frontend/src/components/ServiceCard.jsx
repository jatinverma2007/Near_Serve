import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ServiceCard({ service }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const rating = service.rating?.average || service.rating || 0;
  const reviewCount = service.rating?.count || service.reviewCount || 0;
  const providerName = service.providerId?.businessName || service.provider?.businessName || service.providerName || 'Provider';
  const providerId = service.providerId?._id || service.provider?._id || service.providerId || 'unknown';

  const handleBookNow = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click event
    
    // Navigate to service details page instead of direct booking
    navigate(`/services/${service._id}`);
  };

  const handleCardClick = () => {
    // Navigate to service details page
    navigate(`/services/${service._id}`);
  };

  return (
    <div className="service-item" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="service-item-header">
        <h3>{service.title}</h3>
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
              cursor: 'pointer',
              opacity: 1
            }}
          >
            View Details →
          </button>
        </div>
        {error && <div className="error-text" style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</div>}
      </div>
    </div>
  );
}

export default ServiceCard;
