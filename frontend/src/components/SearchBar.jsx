import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INDIAN_CITIES } from '../constants/cities';

function SearchBar({ initialQuery = '', initialCategory = '', initialCity = '', className = '' }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);

  const categories = [
    { name: 'All Categories', value: '' },
    { name: 'Plumber', value: 'plumber' },
    { name: 'Electrician', value: 'electrician' },
    { name: 'Carpenter', value: 'carpenter' },
    { name: 'Cleaner', value: 'cleaner' },
    { name: 'Painter', value: 'painter' },
    { name: 'Gardener', value: 'gardener' },
    { name: 'Mechanic', value: 'mechanic' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build URL query parameters
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('query', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedCity) params.append('city', selectedCity);
    
    // Navigate to search page with params
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`search-container ${className}`}>
      <input
        type="text"
        placeholder="What service do you need?"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="search-input"
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="category-select"
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.name}
          </option>
        ))}
      </select>
      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        className="category-select"
      >
        <option value="">Select City</option>
        {INDIAN_CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
