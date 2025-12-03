import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProviderProfile } from '../../services/providerAPI';

function ProviderSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    bio: '',
    contactInfo: {
      phone: '',
      alternatePhone: '',
      email: '',
      website: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    categories: [],
    yearsOfExperience: '',
    licenseNumber: '',
    insuranceInfo: ''
  });

  const categoryOptions = [
    'plumber', 'electrician', 'carpenter', 'painter', 'cleaner',
    'gardener', 'mechanic', 'tutor', 'photographer', 'chef', 'other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [field]: value }
      }));
    } else if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.businessName) {
        throw new Error('Business name is required');
      }
      if (!formData.contactInfo.phone) {
        throw new Error('Phone number is required');
      }
      if (!formData.address.city) {
        throw new Error('City is required');
      }
      if (formData.categories.length === 0) {
        throw new Error('Please select at least one category');
      }

      const response = await createProviderProfile(formData);
      
      if (response.success) {
        alert('Provider profile created successfully!');
        navigate('/dashboard/provider');
      }
    } catch (err) {
      console.error('Error creating provider profile:', err);
      setError(err.message || err.errors?.join(', ') || 'Failed to create provider profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="provider-setup">
      <div className="setup-container">
        <h1>🎉 Become a Service Provider</h1>
        <p className="setup-subtitle">Create your provider profile to start offering services</p>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="setup-form">
          {/* Business Information */}
          <section className="form-section">
            <h2>Business Information</h2>
            
            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g., John's Plumbing Services"
                required
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell customers about your business and expertise..."
                rows="4"
                maxLength="500"
              />
              <small>{formData.bio.length}/500 characters</small>
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 5"
              />
            </div>
          </section>

          {/* Contact Information */}
          <section className="form-section">
            <h2>Contact Information</h2>
            
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                required
              />
            </div>

            <div className="form-group">
              <label>Alternate Phone</label>
              <input
                type="tel"
                name="contactInfo.alternatePhone"
                value={formData.contactInfo.alternatePhone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                placeholder="business@example.com"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="contactInfo.website"
                value={formData.contactInfo.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </section>

          {/* Address */}
          <section className="form-section">
            <h2>Business Address</h2>
            
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="123 Main St"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="New York"
                  required
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </div>

              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </div>
            </div>
          </section>

          {/* Service Categories */}
          <section className="form-section">
            <h2>Service Categories *</h2>
            <p className="form-help">Select all categories that apply to your services</p>
            
            <div className="category-grid">
              {categoryOptions.map(category => (
                <label key={category} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <span className="category-label">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Professional Details */}
          <section className="form-section">
            <h2>Professional Details (Optional)</h2>
            
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="e.g., LIC-123456"
              />
            </div>

            <div className="form-group">
              <label>Insurance Information</label>
              <textarea
                name="insuranceInfo"
                value={formData.insuranceInfo}
                onChange={handleChange}
                placeholder="Details about your insurance coverage..."
                rows="3"
              />
            </div>
          </section>

          {/* Submit */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Create Provider Profile'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .provider-setup {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .setup-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .setup-container h1 {
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }

        .setup-subtitle {
          color: #718096;
          margin-bottom: 2rem;
        }

        .setup-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          background: #f7fafc;
        }

        .form-section h2 {
          font-size: 1.25rem;
          color: #2d3748;
          margin-bottom: 1rem;
          border-bottom: 2px solid #667eea;
          padding-bottom: 0.5rem;
        }

        .form-help {
          color: #718096;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #4a5568;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #718096;
          font-size: 0.875rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .category-checkbox {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-checkbox:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .category-checkbox input:checked + .category-label {
          color: #667eea;
          font-weight: 600;
        }

        .category-checkbox input {
          margin-right: 0.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 2rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #fc8181;
        }

        @media (max-width: 768px) {
          .provider-setup {
            padding: 1rem;
          }

          .setup-container {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .category-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

export default ProviderSetup;
