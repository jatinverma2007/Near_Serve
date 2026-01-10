import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderBookings, confirmBooking, rejectBooking, startBooking, completeBooking } from '../../services/bookingAPI';
import { getMyProviderProfile, getProviderServices } from '../../services/providerAPI';
import { createService, updateService, deleteService } from '../../services/serviceAPI';

function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleNavigateToAvailability = () => {
    navigate('/provider/availability');
  };
  
  // Service Form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: 'plumber',
    price: '',
    priceType: 'hourly',
    businessImage: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch profile
      const profileData = await getMyProviderProfile();
      if (profileData.success) {
        setProfile(profileData.provider);
      }
      
      // Fetch bookings
      await fetchBookings();
      
      // Fetch services
      await fetchServices();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Check if it's a "no provider profile" error
      if (err.message && err.message.includes('Provider profile not found')) {
        setError('You don\'t have a provider profile yet. Please complete your provider registration.');
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await getProviderBookings();
      if (data.success) {
        setBookings(data.data || data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await getProviderServices();
      if (data.success) {
        setServices(data.data || data.services || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  // Booking Actions
  const handleAcceptBooking = async (bookingId) => {
    try {
      await confirmBooking(bookingId, 'Booking confirmed. Will contact you shortly.');
      await fetchBookings();
    } catch (err) {
      alert('Error accepting booking: ' + err.message);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await rejectBooking(bookingId, reason);
        await fetchBookings();
      } catch (err) {
        alert('Error rejecting booking: ' + err.message);
      }
    }
  };

  const handleStartBooking = async (bookingId) => {
    try {
      await startBooking(bookingId, 'Service started');
      await fetchBookings();
    } catch (err) {
      alert('Error starting booking: ' + err.message);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await completeBooking(bookingId, 'Service completed successfully');
      await fetchBookings();
    } catch (err) {
      alert('Error completing booking: ' + err.message);
    }
  };

  // Service Form Handlers
  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setServiceForm(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else if (name.startsWith('availability.')) {
      const day = name.split('.')[1];
      setServiceForm(prev => ({
        ...prev,
        availability: { ...prev.availability, [day]: !prev.availability[day] }
      }));
    } else {
      setServiceForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setServiceForm(prev => ({
        ...prev,
        businessImage: reader.result
      }));
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateService = () => {
    setEditingService(null);
    setServiceForm({
      title: '',
      description: '',
      category: 'plumber',
      price: '',
      priceType: 'hourly',
      businessImage: '',
      location: {
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      }
    });
    setShowServiceForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      priceType: service.priceType,
      businessImage: service.businessImage || '',
      location: service.location || {
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      availability: service.availability || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      }
    });
    setShowServiceForm(true);
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!serviceForm.title || !serviceForm.title.trim()) {
      alert('Please enter a service title');
      return;
    }
    
    if (!serviceForm.description || !serviceForm.description.trim()) {
      alert('Please enter a service description');
      return;
    }
    
    if (!serviceForm.price || serviceForm.price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (!serviceForm.location.city || !serviceForm.location.city.trim()) {
      alert('Please enter a city');
      return;
    }
    
    if (!serviceForm.location.state || !serviceForm.location.state.trim()) {
      alert('Please enter a state');
      return;
    }
    
    if (!serviceForm.location.zipCode || !serviceForm.location.zipCode.trim()) {
      alert('Please enter a ZIP code');
      return;
    }
    
    try {
      if (editingService) {
        await updateService(editingService._id, serviceForm);
      } else {
        await createService(serviceForm);
      }
      setShowServiceForm(false);
      await fetchServices();
    } catch (err) {
      alert('Error saving service: ' + err.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
        await fetchServices();
      } catch (err) {
        alert('Error deleting service: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="provider-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isNoProfileError = error.includes('Provider profile not found') || error.includes('provider registration');
    return (
      <div className="provider-dashboard">
        <div className="error-message">
          <h2>⚠️ {isNoProfileError ? 'Provider Profile Required' : 'Error'}</h2>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {isNoProfileError ? (
              <button 
                onClick={() => navigate('/provider/setup')} 
                className="btn-primary"
              >
                Create Provider Profile
              </button>
            ) : (
              <button onClick={fetchDashboardData} className="btn-secondary">
                Retry
              </button>
            )}
            <button onClick={() => navigate('/')} className="btn-secondary">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const inProgressBookings = bookings.filter(b => b.status === 'in-progress');

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Provider Dashboard</h1>
          {profile && <p className="dashboard-subtitle">Welcome back, {profile.businessName}!</p>}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => navigate('/provider/availability')}>
            📅 Availability
          </button>
          <button className="btn-secondary" onClick={() => navigate('/provider/setup')}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{pendingBookings.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value">{confirmedBookings.length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛠️</div>
          <div className="stat-info">
            <div className="stat-value">{inProgressBookings.length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{services.length}</div>
            <div className="stat-label">My Services</div>
          </div>
        </div>
        <div 
          className="stat-card" 
          onClick={() => navigate('/provider/availability')}
          style={{ cursor: 'pointer', border: '2px solid #3b82f6' }}
        >
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-value">Manage</div>
            <div className="stat-label">Availability & Hours</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Booking Requests
        </button>
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          My Services
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Booking Requests</h2>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings yet</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-info">
                        <h3>{booking.service?.title || 'Service'}</h3>
                        <p className="booking-customer">
                          Customer: {booking.user?.name || 'N/A'}
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
                        <span className="detail-label">Phone:</span>
                        <span>{booking.contact?.phone || booking.contactPhone || 'Not provided'}</span>
                      </div>
                      {booking.customerNotes && (
                        <div className="booking-notes">
                          <span className="detail-label">Notes:</span>
                          <p>{booking.customerNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptBooking(booking._id)}
                            className="btn-success"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking._id)}
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStartBooking(booking._id)}
                          className="btn-primary"
                        >
                          Start Service
                        </button>
                      )}
                      {booking.status === 'in-progress' && (
                        <button
                          onClick={() => handleCompleteBooking(booking._id)}
                          className="btn-success"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            <div className="section-header">
              <h2>My Services</h2>
              <button className="btn-primary" onClick={handleCreateService}>
                + Add New Service
              </button>
            </div>

            {showServiceForm && (
              <div className="service-form-overlay">
                <div className="service-form-modal">
                  <div className="modal-header">
                    <h3>{editingService ? 'Edit Service' : 'Create New Service'}</h3>
                    <button
                      className="close-button"
                      onClick={() => setShowServiceForm(false)}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleSubmitService} className="service-form">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={serviceForm.title}
                        onChange={handleServiceFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        name="description"
                        value={serviceForm.description}
                        onChange={handleServiceFormChange}
                        required
                        rows="4"
                        className="form-textarea"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          name="category"
                          value={serviceForm.category}
                          onChange={handleServiceFormChange}
                          className="form-input"
                        >
                          <option value="plumber">Plumber</option>
                          <option value="electrician">Electrician</option>
                          <option value="carpenter">Carpenter</option>
                          <option value="cleaner">Cleaner</option>
                          <option value="painter">Painter</option>
                          <option value="gardener">Gardener</option>
                          <option value="mechanic">Mechanic</option>
                          <option value="tutor">Tutor</option>
                          <option value="photographer">Photographer</option>
                          <option value="chef">Chef</option>
                          <option value="ac-repair">AC Repair</option>
                          <option value="salon">Salon</option>
                          <option value="pest-control">Pest Control</option>
                          <option value="appliance-repair">Appliance Repair</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Price *</label>
                        <input
                          type="number"
                          name="price"
                          value={serviceForm.price}
                          onChange={handleServiceFormChange}
                          required
                          min="0"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Price Type *</label>
                        <select
                          name="priceType"
                          value={serviceForm.priceType}
                          onChange={handleServiceFormChange}
                          className="form-input"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="fixed">Fixed</option>
                          <option value="per-visit">Per Visit</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Business Image (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-input"
                        style={{ padding: '0.5rem' }}
                      />
                      <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                        Upload a photo of your business office, building, or service poster (Max 5MB)
                      </small>
                      {serviceForm.businessImage && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img 
                            src={serviceForm.businessImage} 
                            alt="Preview" 
                            style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="location.address"
                        value={serviceForm.location.address}
                        onChange={handleServiceFormChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="location.city"
                          value={serviceForm.location.city}
                          onChange={handleServiceFormChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          name="location.state"
                          value={serviceForm.location.state}
                          onChange={handleServiceFormChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>ZIP Code *</label>
                        <input
                          type="text"
                          name="location.zipCode"
                          value={serviceForm.location.zipCode}
                          onChange={handleServiceFormChange}
                          required
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Availability</label>
                      <div className="availability-checkboxes">
                        {Object.keys(serviceForm.availability).map(day => (
                          <label key={day} className="checkbox-label">
                            <input
                              type="checkbox"
                              name={`availability.${day}`}
                              checked={serviceForm.availability[day]}
                              onChange={handleServiceFormChange}
                            />
                            <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        {editingService ? 'Update Service' : 'Create Service'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowServiceForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {services.length === 0 ? (
              <div className="empty-state">
                <p>No services yet. Create your first service!</p>
              </div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
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
                          onClick={() => handleEditService(service)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
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
      </div>
    </div>
  );
}

export default ProviderDashboard;
