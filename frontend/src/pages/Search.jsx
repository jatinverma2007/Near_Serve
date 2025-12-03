import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { searchServices } from '../services/serviceAPI';
import ServiceCard from '../components/ServiceCard';
import { INDIAN_CITIES } from '../constants/cities';
import INDIAN_SERVICES from '../data/indianServices';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    rating: ''
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'plumber', label: '🔧 Plumber' },
    { value: 'electrician', label: '⚡ Electrician' },
    { value: 'carpenter', label: '🪚 Carpenter' },
    { value: 'painter', label: '🎨 Painter' },
    { value: 'cleaner', label: '🧹 Cleaner' },
    { value: 'ac-repair', label: '❄️ AC Repair' },
    { value: 'salon', label: '💇 Salon Services' },
    { value: 'pest-control', label: '🐛 Pest Control' },
    { value: 'appliance-repair', label: '🔧 Appliance Repair' },
    { value: 'other', label: '📦 Other' }
  ];

  // Use INDIAN_SERVICES as dummy data
  const dummyServices = INDIAN_SERVICES;

  // Fetch services whenever URL changes
  useEffect(() => {
    // Read filters from URL
    const urlFilters = {
      query: searchParams.get('query') || searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      rating: searchParams.get('rating') || searchParams.get('minRating') || ''
    };
    
    setFilters(urlFilters);
    fetchServices(urlFilters);
  }, [location.search]);

  const fetchServices = async (searchFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      
      // Call search API with all filters
      const response = await searchServices(searchFilters);
      
      if (response.success && response.data && response.data.length > 0) {
        setServices(response.data);
      } else {
        // Use dummy data if API returns no results or for demonstration
        console.log('Using dummy data for demonstration');
        
        // Filter dummy data based on search criteria
        let filteredServices = [...dummyServices];
        
        // Apply query filter
        if (searchFilters.query) {
          const queryLower = searchFilters.query.toLowerCase();
          filteredServices = filteredServices.filter(service => 
            service.title.toLowerCase().includes(queryLower) ||
            service.description.toLowerCase().includes(queryLower) ||
            service.category.toLowerCase().includes(queryLower)
          );
        }
        
        // Apply category filter
        if (searchFilters.category) {
          filteredServices = filteredServices.filter(service => 
            service.category === searchFilters.category
          );
        }
        
        // Apply city filter
        if (searchFilters.city) {
          filteredServices = filteredServices.filter(service => 
            service.location.city === searchFilters.city
          );
        }
        
        // Apply price range filter
        if (searchFilters.minPrice) {
          filteredServices = filteredServices.filter(service => 
            service.price >= Number(searchFilters.minPrice)
          );
        }
        
        if (searchFilters.maxPrice) {
          filteredServices = filteredServices.filter(service => 
            service.price <= Number(searchFilters.maxPrice)
          );
        }
        
        // Apply rating filter
        if (searchFilters.rating) {
          filteredServices = filteredServices.filter(service => 
            service.rating.average >= Number(searchFilters.rating)
          );
        }
        
        setServices(filteredServices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      // On error, also use dummy data
      console.log('Error occurred, using dummy data');
      setServices(dummyServices);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL params which will trigger useEffect to fetch
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
  };

  const handleReset = () => {
    const emptyFilters = {
      query: '',
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      rating: ''
    };
    setFilters(emptyFilters);
    setSearchParams({});
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Find Services</h1>
        <p>Discover local service providers in your area</p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filters">
        <form onSubmit={handleSearch} className="filter-form">
          <div className="filter-row">
            <div className="filter-group">
              <input
                type="text"
                name="query"
                placeholder="Search services..."
                value={filters.query}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Select City</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="filter-input"
                min="0"
              />
            </div>

            <div className="filter-group">
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="filter-input"
                min="0"
              />
            </div>

            <div className="filter-group">
              <select
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary">
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="search-results">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchServices} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="no-results">
            <p>No services found matching your criteria.</p>
            <button onClick={handleReset} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="results-header">
              <h2>Found {services.length} service{services.length !== 1 ? 's' : ''}</h2>
            </div>
            <div className="services-list">
              {services.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
