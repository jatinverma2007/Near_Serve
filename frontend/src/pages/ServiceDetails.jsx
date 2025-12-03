import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getServiceById, getServiceReviews } from '../services/serviceAPI';
import BookingForm from '../components/BookingForm';
import { useAuth } from '../contexts/AuthContext';

function ServiceDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
    fetchReviews();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getServiceById(id);
      if (data.success) {
        setService(data.service);
      } else {
        setError('Service not found');
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      setError(err.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getServiceReviews(id);
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    // You can add a success message or redirect here
  };

  if (loading) {
    return (
      <div className="service-details-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-details-page">
        <div className="error-message">
          <p>{error || 'Service not found'}</p>
          <Link to="/search" className="btn-secondary">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const rating = service.rating?.average || service.rating || 0;
  const reviewCount = service.rating?.count || service.reviewCount || 0;
  const providerName = service.provider?.businessName || 'Provider';
  const providerId = service.provider?._id || service.providerId;

  return (
    <div className="service-details-page">
      {/* Service Header */}
      <div className="service-header">
        <div className="service-header-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span> / </span>
            <Link to="/search">Search</Link>
            <span> / </span>
            <span>{service.title}</span>
          </div>
          <h1>{service.title}</h1>
          <div className="service-meta-header">
            <div className="rating-large">
              <span className="rating-star">⭐</span>
              <span className="rating-value">{rating.toFixed(1)}</span>
              <span className="rating-count">({reviewCount} reviews)</span>
            </div>
            <span className="category-badge">{service.category}</span>
            <span className="location-badge">
              📍 {service.location?.city}, {service.location?.state}
            </span>
          </div>
        </div>
        <div className="service-price-card">
          <div className="price-label">Starting at</div>
          <div className="price-amount">${service.price}</div>
          <div className="price-type">
            {service.priceType === 'hourly' ? 'per hour' :
             service.priceType === 'per-visit' ? 'per visit' :
             service.priceType === 'fixed' ? 'fixed price' : ''}
          </div>
          <button 
            className="btn-book"
            onClick={() => setShowBookingForm(!showBookingForm)}
          >
            {showBookingForm ? 'Hide Booking Form' : 'Book Now'}
          </button>
        </div>
      </div>

      <div className="service-details-content">
        {/* Main Content */}
        <div className="service-main">
          {/* Images */}
          {service.images && service.images.length > 0 && (
            <div className="service-images">
              <img 
                src={service.images[0]} 
                alt={service.title}
                className="main-image"
              />
              {service.images.length > 1 && (
                <div className="image-gallery">
                  {service.images.slice(1, 5).map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`${service.title} ${index + 2}`}
                      className="gallery-image"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="service-section">
            <h2>Description</h2>
            <p className="service-description">{service.description}</p>
          </div>

          {/* Availability */}
          {service.availability && (
            <div className="service-section">
              <h2>Availability</h2>
              <div className="availability-grid">
                {Object.entries(service.availability).map(([day, isAvailable]) => (
                  <div key={day} className={`availability-item ${isAvailable ? 'available' : 'unavailable'}`}>
                    <span className="day-name">{day}</span>
                    <span className="status">{isAvailable ? '✓ Available' : '✗ Unavailable'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="service-section reviews-section">
            <h2>Customer Reviews ({reviewCount})</h2>
            {reviewsLoading ? (
              <div className="loading-small">
                <div className="spinner-small"></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="review-author">
                        <strong>{review.user?.name || 'Anonymous'}</strong>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="review-images">
                        {review.images.map((img, index) => (
                          <img key={index} src={img} alt="Review" className="review-image" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="service-sidebar">
          {/* Provider Card */}
          <div className="provider-card">
            <h3>Service Provider</h3>
            <Link to={`/provider/${providerId}`} className="provider-link">
              {service.provider?.profileImage && (
                <img 
                  src={service.provider.profileImage}
                  alt={providerName}
                  className="provider-avatar"
                />
              )}
              <div className="provider-info">
                <h4>{providerName}</h4>
                {service.provider?.rating && (
                  <div className="provider-rating">
                    <span>⭐</span>
                    <span>{service.provider.rating.average?.toFixed(1)}</span>
                    <span className="review-count">
                      ({service.provider.rating.count} reviews)
                    </span>
                  </div>
                )}
              </div>
            </Link>
            {service.provider?.bio && (
              <p className="provider-bio">{service.provider.bio}</p>
            )}
            {service.provider?.verified && (
              <div className="verified-provider">
                <span className="verified-icon">✓</span>
                Verified Provider
              </div>
            )}
          </div>

          {/* Booking Form */}
          {showBookingForm && user && (
            <div className="booking-form-container">
              <h3>Book This Service</h3>
              <BookingForm 
                serviceId={service._id}
                servicePrice={service.price}
                servicePriceType={service.priceType}
                onSuccess={handleBookingSuccess}
              />
            </div>
          )}

          {!user && showBookingForm && (
            <div className="login-prompt">
              <p>Please login to book this service</p>
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            </div>
          )}

          {/* Contact Info */}
          {service.provider?.contactInfo && (
            <div className="contact-card">
              <h3>Contact Information</h3>
              {service.provider.contactInfo.phone && (
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>{service.provider.contactInfo.phone}</span>
                </div>
              )}
              {service.provider.contactInfo.email && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>{service.provider.contactInfo.email}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceDetails;
