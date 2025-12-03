import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <h2>NearServe</h2>
          </Link>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/search" className="nav-link">Search Services</Link>

            {!loading && user?.role === 'customer' && (
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
            )}

            {!loading && user?.role === 'provider' && (
              <Link to="/provider/dashboard" className="nav-link">Provider Dashboard</Link>
            )}
          </div>

          <div className="nav-user">
            {loading ? (
              <span className="user-name">Loading...</span>
            ) : (
              <>
                <span className="user-name">Hello, {user?.name || 'User'}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2025 NearServe. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
