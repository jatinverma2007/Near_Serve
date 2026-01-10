import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getServiceById, getServiceReviews } from '../services/serviceAPI';
import { createReview } from '../services/reviewAPI';
import BookingForm from '../components/BookingForm';
import { useAuth } from '../contexts/AuthContext';

function ServiceDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [bookingIdForReview, setBookingIdForReview] = useState(null);

  useEffect(() => {
    fetchServiceDetails();
    fetchReviews();
    
    // Check if we should show review form from navigation state
    if (location.state?.showReviewForm && location.state?.bookingId) {
      setShowReviewForm(true);
      setBookingIdForReview(location.state.bookingId);
      // Scroll to review form
      setTimeout(() => {
        document.querySelector('.review-form-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [id, location.state]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getServiceById(id);
      if (data.success) {
        setService(data.data);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    console.log('=== Review Submission Debug ===');
    console.log('Booking ID:', bookingIdForReview);
    console.log('Service ID:', id);
    console.log('Rating:', reviewRating);
    console.log('Comment:', reviewComment);
    
    if (!bookingIdForReview) {
      const errorMsg = 'Booking information is missing. Please navigate from your bookings page.';
      console.log('Error:', errorMsg);
      setReviewError(errorMsg);
      return;
    }
    
    if (reviewRating < 1 || reviewRating > 5) {
      const errorMsg = 'Please select a rating between 1 and 5 stars';
      console.log('Error:', errorMsg);
      setReviewError(errorMsg);
      return;
    }
    
    if (!reviewComment.trim()) {
      const errorMsg = 'Please write a review comment';
      console.log('Error:', errorMsg);
      setReviewError(errorMsg);
      return;
    }
    
    try {
      setReviewSubmitting(true);
      setReviewError('');
      
      const reviewData = {
        bookingId: bookingIdForReview,
        serviceId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        images: []
      };
      
      console.log('Submitting review data:', reviewData);
      
      const response = await createReview(reviewData);
      
      console.log('Review response:', response);
      
      if (response.success) {
        console.log('Review submitted successfully!');
        // Reset form
        setShowReviewForm(false);
        setReviewRating(0);
        setReviewComment('');
        setBookingIdForReview(null);
        
        // Refresh reviews
        await fetchReviews();
        await fetchServiceDetails(); // Refresh to update rating
        
        alert('Review submitted successfully!');
      } else {
        // Handle error response
        const errorMsg = response.message || 'Failed to submit review';
        console.log('Server error:', errorMsg);
        setReviewError(errorMsg);
      }
    } catch (err) {
      console.error('=== Error submitting review ===');
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      
      // Better error handling
      let errorMessage = 'Failed to submit review';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        errorMessage = err.error;
      }
      
      console.log('Displaying error:', errorMessage);
      setReviewError(errorMessage);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setReviewRating(0);
    setReviewComment('');
    setReviewError('');
    setBookingIdForReview(null);
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
  const providerName = service.providerId?.businessName || service.provider?.businessName || 'Provider';
  const providerId = service.providerId?._id || service.provider?._id || service.providerId;

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
          <div className="price-amount">₹{service.price}</div>
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
          {/* Business Image */}
          {service.businessImage && (
            <div className="service-images">
              <img 
                src={service.businessImage} 
                alt={`${service.title} - Business`}
                className="main-image"
              />
            </div>
          )}

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
          {service.providerAvailability && service.providerAvailability.weeklyAvailability && 
           service.providerAvailability.weeklyAvailability.length > 0 && (
            <div className="service-section">
              <h2>Provider Availability</h2>
              <div className="availability-schedule">
                {service.providerAvailability.weeklyAvailability.map((dayAvailability, index) => (
                  <div key={index} className="availability-day">
                    <div className="day-name">
                      {dayAvailability.day.charAt(0).toUpperCase() + dayAvailability.day.slice(1)}
                    </div>
                    <div className="day-slots">
                      {dayAvailability.slots && dayAvailability.slots.length > 0 ? (
                        dayAvailability.slots.map((slot, idx) => (
                          <div key={idx} className="time-slot">
                            {slot.start} - {slot.end}
                          </div>
                        ))
                      ) : (
                        <span className="unavailable-text">Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {service.providerAvailability.holidays && service.providerAvailability.holidays.length > 0 && (
                <div className="holidays-info">
                  <h3>Upcoming Holidays</h3>
                  {service.providerAvailability.holidays.slice(0, 3).map((holiday, idx) => (
                    <div key={idx} className="holiday-item">
                      <span className="holiday-date">{new Date(holiday.date).toLocaleDateString()}</span>
                      <span className="holiday-reason">{holiday.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fallback: Show simple availability if detailed schedule not available */}
          {(!service.providerAvailability || !service.providerAvailability.weeklyAvailability || 
            service.providerAvailability.weeklyAvailability.length === 0) && 
           service.availability && typeof service.availability === 'object' && (
            <div className="service-section">
              <h2>Availability</h2>
              <div className="availability-grid">
                {Object.entries(service.availability).map(([day, isAvailable]) => (
                  <div key={day} className={`availability-item ${isAvailable ? 'available' : 'unavailable'}`}>
                    <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <span className="status">{isAvailable ? '✓ Available' : '✗ Unavailable'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show simple availability if boolean */}
          {(!service.providerAvailability || !service.providerAvailability.weeklyAvailability || 
            service.providerAvailability.weeklyAvailability.length === 0) &&
           typeof service.availability === 'boolean' && (
            <div className="service-section">
              <h2>Availability</h2>
              <div className="availability-status">
                <span className={service.availability ? 'available' : 'unavailable'}>
                  {service.availability ? '✓ Currently Available' : '✗ Currently Unavailable'}
                </span>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="service-section reviews-section">
            <h2>Customer Reviews ({reviewCount})</h2>
            
            {/* Show review form button for logged-in users (if not already showing) */}
            {!showReviewForm && user && user.role === 'customer' && (
              <button 
                className="btn-primary" 
                onClick={() => {
                  setShowReviewForm(true);
                  // If no bookingId from navigation, we'll show a message
                  if (!bookingIdForReview) {
                    setReviewError('Please write a review from your bookings page to link it to a specific booking.');
                  }
                }}
                style={{ marginBottom: '1rem' }}
              >
                Write a Review
              </button>
            )}
            
            {/* Review Form - Show when user clicks Write Review */}
            {showReviewForm && user && (
              <div className="review-form-section">
                <h3>Write Your Review</h3>
                {bookingIdForReview && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Writing review for your booking
                  </p>
                )}
                <form onSubmit={handleSubmitReview} className="review-form">
                  {reviewError && (
                    <div className="form-error">
                      {reviewError}
                    </div>
                  )}
                  
                  {/* Star Rating */}
                  <div className="form-group">
                    <label>Rating *</label>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= reviewRating ? 'active' : ''}`}
                          onClick={() => setReviewRating(star)}
                          disabled={reviewSubmitting}
                        >
                          ⭐
                        </button>
                      ))}
                      <span className="rating-label">
                        {reviewRating > 0 && (
                          reviewRating === 1 ? 'Poor' :
                          reviewRating === 2 ? 'Fair' :
                          reviewRating === 3 ? 'Good' :
                          reviewRating === 4 ? 'Very Good' : 'Excellent'
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Review Comment */}
                  <div className="form-group">
                    <label htmlFor="review-comment">Your Review *</label>
                    <textarea
                      id="review-comment"
                      className="form-textarea"
                      placeholder="Share your experience with this service..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows="5"
                      disabled={reviewSubmitting}
                      required
                    />
                  </div>
                  
                  {/* Form Actions */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelReview}
                      disabled={reviewSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={reviewSubmitting || reviewRating === 0 || !reviewComment.trim()}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
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
              {(service.providerId?.profileImage || service.provider?.profileImage) && (
                <img 
                  src={service.providerId?.profileImage || service.provider?.profileImage}
                  alt={providerName}
                  className="provider-avatar"
                />
              )}
              <div className="provider-info">
                <h4>{providerName}</h4>
                {(service.providerId?.rating || service.provider?.rating) && (
                  <div className="provider-rating">
                    <span>⭐</span>
                    <span>{(service.providerId?.rating?.average || service.provider?.rating?.average)?.toFixed(1)}</span>
                    <span className="review-count">
                      ({service.providerId?.rating?.count || service.provider?.rating?.count} reviews)
                    </span>
                  </div>
                )}
              </div>
            </Link>
            {(service.providerId?.bio || service.provider?.bio) && (
              <p className="provider-bio">{service.providerId?.bio || service.provider?.bio}</p>
            )}
            {(service.providerId?.verified || service.provider?.verified) && (
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
          {(service.providerId?.contactInfo || service.provider?.contactInfo) && (
            <div className="contact-card">
              <h3>Contact Information</h3>
              {(service.providerId?.contactInfo?.phone || service.provider?.contactInfo?.phone) && (
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>{service.providerId?.contactInfo?.phone || service.provider?.contactInfo?.phone}</span>
                </div>
              )}
              {(service.providerId?.contactInfo?.email || service.provider?.contactInfo?.email) && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>{service.providerId?.contactInfo?.email || service.provider?.contactInfo?.email}</span>
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

