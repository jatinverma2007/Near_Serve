import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

function RoleSelection() {
  const navigate = useNavigate();
  const { user, updateUser, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelection = async (selectedRole) => {
    if (!token) {
      setError('Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.put('/users/set-role', { role: selectedRole });
      
      if (response.data.success) {
        // Update user in context with new role
        updateUser(response.data.user);
        
        // Navigate based on role
        if (selectedRole === 'provider') {
          navigate('/dashboard/provider', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set role. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-wrapper">
        <div className="role-header">
          <h1>Welcome to NearServe</h1>
          <p>Choose your role to continue</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '2rem', textAlign: 'center', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="role-boxes-horizontal">
          {/* Customer Card */}
          <button
            onClick={() => handleRoleSelection('customer')}
            disabled={loading}
            className="role-box role-box-white"
          >
            <div className="role-icon">🛍️</div>
            <h2>Customer</h2>
            <p>Find and book services</p>
          </button>

          {/* Provider Card */}
          <button
            onClick={() => handleRoleSelection('provider')}
            disabled={loading}
            className="role-box role-box-black"
          >
            <div className="role-icon">🔧</div>
            <h2>Service Provider</h2>
            <p>Offer your services</p>
          </button>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem',
            color: '#6b7280',
            fontSize: '0.95rem'
          }}>
            Setting up your account...
          </div>
        )}
      </div>
    </div>
  );
}

export default RoleSelection;
