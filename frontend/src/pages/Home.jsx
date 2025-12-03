import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from '../components/SearchBar';
import { getAllServices } from '../services/serviceAPI';
import { getTopProviders } from '../services/providerAPI';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Plumber', icon: '🔧', value: 'plumber' },
    { name: 'Electrician', icon: '⚡', value: 'electrician' },
    { name: 'Carpenter', icon: '🪚', value: 'carpenter' },
    { name: 'Cleaner', icon: '🧹', value: 'cleaner' },
    { name: 'Painter', icon: '🎨', value: 'painter' },
    { name: 'AC Repair', icon: '❄️', value: 'ac-repair' },
    { name: 'Salon', icon: '💇', value: 'salon' },
    { name: 'Pest Control', icon: '🐛', value: 'pest-control' },
    { name: 'Appliance Repair', icon: '🔧', value: 'appliance-repair' },
  ];

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured services
        const servicesResponse = await getAllServices({ limit: 8 });
        if (servicesResponse.success && servicesResponse.data) {
          setFeaturedServices(servicesResponse.data);
        }
        
        // Fetch top providers
        try {
          const providersResponse = await getTopProviders({ limit: 3 });
          if (providersResponse.success && providersResponse.data) {
            setFeaturedProviders(providersResponse.data);
          }
        } catch (err) {
          console.log('Could not fetch providers:', err);
          setFeaturedProviders([]);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${category}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section with Search */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to NearServe{user?.name ? `, ${user.name}` : ''}! 👋</h1>
          <p className="hero-subtitle">Find trusted service providers near you</p>
          <p className="hero-description">
            Connect with professional plumbers, electricians, carpenters, and more in your area
          </p>
          
          {/* Search Bar */}
          <div className="hero-search">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="services-section">
        <h2>Popular Services</h2>
        <div className="services-grid">
          {categories.map((category) => (
            <div
              key={category.name}
              onClick={() => handleCategoryClick(category.value)}
              className="service-card"
            >
              <div className="service-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="featured-services-section">
        <div className="section-header">
          <h2>Featured Services</h2>
          <Link to="/search" className="view-all-link">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="loading-state">Loading services...</div>
        ) : featuredServices.length === 0 ? (
          <div className="empty-state">
            <p>No services available yet. Be the first provider to add services!</p>
            <Link to="/search" className="btn-primary">Browse Services</Link>
          </div>
        ) : (
          <div className="featured-services-grid">
            {featuredServices.map((service) => (
              <Link
                key={service._id}
                to={`/services/${service._id}`}
                className="featured-service-card"
              >
                <div className="service-image-container">
                  <img
                    src={service.images?.[0] || 'https://via.placeholder.com/300x200?text=Service'}
                    alt={service.title}
                    className="service-image"
                  />
                  <div className="service-category-badge">{service.category}</div>
                </div>
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-provider">
                    <span>by {service.providerId?.businessName || 'Provider'}</span>
                  </div>
                  <div className="service-footer">
                    <div className="service-rating">
                      <span className="rating-star">⭐</span>
                      <span className="rating-value">{service.rating?.average || service.rating || 0}</span>
                      <span className="rating-count">({service.rating?.count || 0})</span>
                    </div>
                    <div className="service-price">
                      <span className="price-amount">₹{service.price}</span>
                      <span className="price-type">/{service.priceType || 'service'}</span>
                    </div>
                  </div>
                  <div className="service-location">
                    📍 {service.location?.city || 'N/A'}, {service.location?.state || ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Providers Section */}
      <section className="featured-providers-section">
        <div className="section-header">
          <h2>Top Rated Providers</h2>
          <Link to="/search" className="view-all-link">
            View All →
          </Link>
        </div>
        {featuredProviders.length === 0 ? (
          <div className="empty-state">
            <p>No providers available yet.</p>
          </div>
        ) : (
          <div className="featured-providers-grid">
            {featuredProviders.map((provider) => (
              <Link
                key={provider._id}
                to={`/provider/${provider._id}`}
                className="featured-provider-card"
              >
                <div className="provider-header">
                  <img
                    src={provider.profileImage || 'https://via.placeholder.com/100?text=Provider'}
                    alt={provider.businessName}
                    className="provider-image"
                  />
                  {provider.verified && (
                    <div className="verified-badge" title="Verified Provider">
                      ✓
                    </div>
                  )}
                </div>
                <div className="provider-content">
                  <h3 className="provider-name">{provider.businessName}</h3>
                  <p className="provider-bio">{provider.bio || 'Professional service provider'}</p>
                  <div className="provider-categories">
                    {(provider.categories || []).map((cat) => (
                      <span key={cat} className="category-tag">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <div className="provider-stats">
                    <div className="stat-item">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">{provider.rating?.average || 0}</span>
                      <span className="stat-label">({provider.rating?.count || 0} reviews)</span>
                    </div>
                    {provider.stats?.totalBookings > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">✓</span>
                        <span className="stat-value">
                          {Math.round((provider.stats.completedBookings / provider.stats.totalBookings) * 100)}%
                        </span>
                        <span className="stat-label">completion</span>
                      </div>
                    )}
                  </div>
                  {provider.location && (
                    <div className="provider-location">
                      📍 {provider.location.city || 'N/A'}, {provider.location.state || ''}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose NearServe?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Easy Search</h3>
            <p>Find local service providers quickly and easily with our advanced search filters</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Verified Providers</h3>
            <p>All providers are verified and rated by real customers for your peace of mind</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Direct Communication</h3>
            <p>Connect directly with service providers to discuss your requirements</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Booking</h3>
            <p>Book services with just a few clicks and manage your appointments easily</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
