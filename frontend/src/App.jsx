import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Auth Pages
import { Login, Register } from './pages/Auth';
import RoleSelection from './pages/Auth/RoleSelection';
import OAuthCallback from './pages/Auth/OAuthCallback';

// Main Pages
import Home from './pages/Home';
import Search from './pages/Search';
import ServiceDetails from './pages/ServiceDetails';
import ProviderProfile from './pages/ProviderProfile';

// Dashboards
import { UserDashboard, ProviderDashboard } from './pages/Dashboard';
import ProviderAvailability from './pages/Dashboard/ProviderAvailability';
import ProviderSetup from './pages/Dashboard/ProviderSetup';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google-callback" element={<OAuthCallback />} />


          {/* Role selection page (protected but no layout wrapper) */}
          <Route
            path="/select-role"
            element={
              <ProtectedRoute>
                <RoleSelection />
              </ProtectedRoute>
            }
          />

          {/* Protected routes inside layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Home */}
            <Route index element={<Home />} />

            {/* Search Page */}
            <Route path="search" element={<Search />} />

            {/* Service Details */}
            <Route path="services/:id" element={<ServiceDetails />} />

            {/* Provider public profile */}
            <Route path="provider/:id" element={<ProviderProfile />} />

            {/* USER DASHBOARD = My Bookings */}
            <Route path="my-bookings" element={<UserDashboard />} />

            {/* PROVIDER DASHBOARD */}
            <Route path="provider/dashboard" element={<ProviderDashboard />} />

            {/* Provider setup page after choosing provider role */}
            <Route path="provider/setup" element={<ProviderSetup />} />

            {/* Provider availability settings */}
            <Route path="provider/availability" element={<ProviderAvailability />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
