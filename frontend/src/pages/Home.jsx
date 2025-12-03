import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from '../components/SearchBar';
import INDIAN_SERVICES from '../data/indianServices';
import ServiceCard from '../components/ServiceCard';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Use Indian services data - get first 8 as featured
  const featuredServices = INDIAN_SERVICES.slice(0, 8);

  // Dummy featured providers data
  const featuredProviders = [
    {
      _id: 'p1',
      businessName: 'Cool Air Services',
      bio: 'Professional AC repair and servicing with 15+ years of experience. All brands covered.',
      categories: ['ac-repair'],
      rating: { average: 4.8, count: 124 },
      location: { city: 'Delhi', state: 'Delhi' },
      stats: { totalBookings: 450, completedBookings: 442 },
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
      verified: true,
    },
    {
      _id: 'p2',
      businessName: 'CleanPro India',
      bio: 'Eco-friendly home and office cleaning services with trained professionals across Mumbai.',
      categories: ['cleaner'],
      rating: { average: 4.9, count: 89 },
      location: { city: 'Mumbai', state: 'Maharashtra' },
      stats: { totalBookings: 320, completedBookings: 315 },
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      verified: true,
    },
    {
      _id: 'p3',
      businessName: 'Sharma Electricals',
      bio: 'Licensed electricians providing safe and reliable electrical services for homes and offices.',
      categories: ['electrician'],
      rating: { average: 4.7, count: 156 },
      location: { city: 'Bengaluru', state: 'Karnataka' },
      stats: { totalBookings: 580, completedBookings: 571 },
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      verified: true,
    },
  ];

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
        <div className="featured-services-grid">
          {featuredServices.map((service) => (
            <Link
              key={service._id}
              to={`/services/${service._id}`}
              className="featured-service-card"
            >
              <div className="service-image-container">
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="service-image"
                />
                <div className="service-category-badge">{service.category}</div>
              </div>
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-provider">
                  <span>by {service.provider.businessName}</span>
                </div>
                <div className="service-footer">
                  <div className="service-rating">
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{service.rating.average}</span>
                    <span className="rating-count">({service.rating.count})</span>
                  </div>
                  <div className="service-price">
                    <span className="price-amount">₹{service.price}</span>
                    <span className="price-type">/{service.priceType}</span>
                  </div>
                </div>
                <div className="service-location">
                  📍 {service.location.city}, {service.location.state}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className="featured-providers-section">
        <div className="section-header">
          <h2>Top Rated Providers</h2>
          <Link to="/search" className="view-all-link">
            View All →
          </Link>
        </div>
        <div className="featured-providers-grid">
          {featuredProviders.map((provider) => (
            <Link
              key={provider._id}
              to={`/provider/${provider._id}`}
              className="featured-provider-card"
            >
              <div className="provider-header">
                <img
                  src={provider.profileImage}
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
                <p className="provider-bio">{provider.bio}</p>
                <div className="provider-categories">
                  {provider.categories.map((cat) => (
                    <span key={cat} className="category-tag">
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="provider-stats">
                  <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-value">{provider.rating.average}</span>
                    <span className="stat-label">({provider.rating.count} reviews)</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">✓</span>
                    <span className="stat-value">
                      {Math.round((provider.stats.completedBookings / provider.stats.totalBookings) * 100)}%
                    </span>
                    <span className="stat-label">completion</span>
                  </div>
                </div>
                <div className="provider-location">
                  📍 {provider.location.city}, {provider.location.state}
                </div>
              </div>
            </Link>
          ))}
        </div>
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
