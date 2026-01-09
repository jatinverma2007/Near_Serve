import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../../services/bookingAPI';
import { getMyReviews, deleteReview } from '../../services/reviewAPI';

function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch bookings
      await fetchBookings();
      
      // Fetch reviews
      await fetchReviews();
      
      // TODO: Fetch favorites when API is ready
      setFavorites([]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await getUserBookings();
      if (data.success) {
        // Backend returns data in 'data' field, not 'bookings'
        setBookings(data.data || data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await getMyReviews();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // Filter bookings
  const upcomingBookings = bookings.filter(b => 
    ['pending', 'confirmed', 'in-progress'].includes(b.status)
  );
  const pastBookings = bookings.filter(b => 
    ['completed', 'cancelled', 'rejected'].includes(b.status)
  );

  // Booking Actions
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        await fetchBookings();
      } catch (err) {
        alert('Error cancelling booking: ' + err.message);
      }
    }
  };

  const handleViewService = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  const handleWriteReview = (booking) => {
    navigate(`/services/${booking.serviceId?._id || booking.service?._id}`, { 
      state: { showReviewForm: true, bookingId: booking._id } 
    });
  };

  // Review Actions
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        await fetchReviews();
      } catch (err) {
        alert('Error deleting review: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Dashboard</h1>
          <p className="dashboard-subtitle">Manage your bookings and reviews</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/search')}>
          Find Services
        </button>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-value">{upcomingBookings.length}</div>
            <div className="stat-label">Upcoming Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value">{pastBookings.length}</div>
            <div className="stat-label">Past Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">My Reviews</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-info">
            <div className="stat-value">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Bookings
        </button>
        <button
          className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Bookings
        </button>
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          My Reviews
        </button>
        <button
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {/* Upcoming Bookings Tab */}
        {activeTab === 'upcoming' && (
          <div className="bookings-section">
            <h2>Upcoming Bookings</h2>
            {upcomingBookings.length === 0 ? (
              <div className="empty-state">
                <p>No upcoming bookings</p>
                <button className="btn-primary" onClick={() => navigate('/search')}>
                  Find Services
                </button>
              </div>
            ) : (
              <div className="bookings-list">
                {upcomingBookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-info">
                        <h3>{booking.serviceId?.title || booking.service?.title || 'Service'}</h3>
                        <p className="booking-provider">
                          Provider: {booking.providerId?.businessName || booking.provider?.businessName || 'N/A'}
                        </p>
                      </div>
                      <div className={`booking-status status-${booking.status}`}>
                        {booking.status}
                      </div>
                    </div>
                    <div className="booking-details">
                      <div className="booking-detail">
                        <span className="detail-label">Date:</span>
                        <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Time:</span>
                        <span>{booking.scheduledTime}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Location:</span>
                        <span>{booking.address?.city}, {booking.address?.state}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Total:</span>
                        <span className="price-amount">₹{booking.price}</span>
                      </div>
                    </div>
                    {booking.providerNotes && (
                      <div className="booking-notes">
                        <span className="detail-label">Provider Notes:</span>
                        <p>{booking.providerNotes}</p>
                      </div>
                    )}
                    <div className="booking-actions">
                      <button
                        onClick={() => handleViewService(booking.serviceId?._id || booking.service?._id)}
                        className="btn-primary"
                      >
                        View Service
                      </button>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="btn-danger"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Past Bookings Tab */}
        {activeTab === 'past' && (
          <div className="bookings-section">
            <h2>Past Bookings</h2>
            {pastBookings.length === 0 ? (
              <div className="empty-state">
                <p>No past bookings</p>
              </div>
            ) : (
              <div className="bookings-list">
                {pastBookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-info">
                        <h3>{booking.serviceId?.title || booking.service?.title || 'Service'}</h3>
                        <p className="booking-provider">
                          Provider: {booking.providerId?.businessName || booking.provider?.businessName || 'N/A'}
                        </p>
                      </div>
                      <div className={`booking-status status-${booking.status}`}>
                        {booking.status}
                      </div>
                    </div>
                    <div className="booking-details">
                      <div className="booking-detail">
                        <span className="detail-label">Date:</span>
                        <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Time:</span>
                        <span>{booking.scheduledTime}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Location:</span>
                        <span>{booking.address?.city}, {booking.address?.state}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">Total:</span>
                        <span className="price-amount">₹{booking.price}</span>
                      </div>
                      {booking.status === 'completed' && booking.completedAt && (
                        <div className="booking-detail">
                          <span className="detail-label">Completed:</span>
                          <span>{new Date(booking.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {booking.providerNotes && (
                      <div className="booking-notes">
                        <span className="detail-label">Provider Notes:</span>
                        <p>{booking.providerNotes}</p>
                      </div>
                    )}
                    <div className="booking-actions">
                      <button
                        onClick={() => handleViewService(booking.serviceId?._id || booking.service?._id)}
                        className="btn-secondary"
                      >
                        View Service
                      </button>
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => handleWriteReview(booking)}
                          className="btn-primary"
                        >
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <h2>My Reviews</h2>
            {reviews.length === 0 ? (
              <div className="empty-state">
                <p>You haven't written any reviews yet</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review._id} className="review-card user-review-card">
                    <div className="review-header">
                      <div className="review-service-info">
                        <h3>{review.service?.title || 'Service'}</h3>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                          <span className="rating-value">{review.rating}/5</span>
                        </div>
                      </div>
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="review-body">
                      <p className="review-comment">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="review-images">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review ${idx + 1}`}
                              className="review-image"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="review-footer">
                      <div className="review-meta">
                        <span className="review-provider">
                          Provider: {review.provider?.businessName || 'N/A'}
                        </span>
                      </div>
                      <div className="review-actions">
                        <button
                          onClick={() => handleViewService(review.service._id)}
                          className="btn-secondary"
                        >
                          View Service
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="favorites-section">
            <h2>Favorite Services</h2>
            {favorites.length === 0 ? (
              <div className="empty-state">
                <p>No favorite services yet</p>
                <p className="empty-state-subtitle">
                  Browse services and add them to your favorites
                </p>
                <button className="btn-primary" onClick={() => navigate('/search')}>
                  Find Services
                </button>
              </div>
            ) : (
              <div className="services-grid">
                {favorites.map(service => (
                  <div key={service._id} className="service-card-dashboard">
                    <div className="service-card-header">
                      <h3>{service.title}</h3>
                      <span className="service-category-small">{service.category}</span>
                    </div>
                    <p className="service-description-small">
                      {service.description?.substring(0, 100)}...
                    </p>
                    <div className="service-card-footer">
                      <div className="service-price-small">
                        ₹{service.price}/{service.priceType}
                      </div>
                      <div className="service-card-actions">
                        <button
                          onClick={() => handleViewService(service._id)}
                          className="btn-primary"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {/* TODO: Remove from favorites */}}
                          className="btn-secondary"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
