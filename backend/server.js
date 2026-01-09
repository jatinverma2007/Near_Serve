const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config');
const passport = require('./config/googleAuth');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const providerRoutes = require('./routes/providerRoutes');
const authMiddleware = require('./middleware/auth');
const User = require('./models/user');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://near-serve-mocha.vercel.app',
        'https://near-serve.vercel.app',
        /\.vercel\.app$/
      ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180', 'http://localhost:5181', 'http://localhost:5182', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with configuration
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(passport.initialize()); // Initialize Passport for OAuth
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increased limit for base64 images
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for base64 images

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Server',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/profile (protected)',
      services: 'GET /api/services',
      createService: 'POST /api/services (protected)',
      serviceDetails: 'GET /api/services/:id',
      createBooking: 'POST /api/bookings (protected)',
      userBookings: 'GET /api/bookings (protected)',
      providerBookings: 'GET /api/bookings/provider/bookings (protected)',
      updateBookingStatus: 'PUT /api/bookings/:id/status (protected)',
      createReview: 'POST /api/reviews (protected)',
      serviceReviews: 'GET /api/services/:id/reviews',
      notifications: 'GET /api/notifications (protected)',
      markAsRead: 'PUT /api/notifications/:id/read (protected)',
      unreadCount: 'GET /api/notifications/unread-count (protected)'
    }
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Service routes
app.use('/api/services', serviceRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Provider routes (including availability)
app.use('/api/providers', providerRoutes);

// Protected route - requires valid JWT token
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`JWT expiry: ${config.JWT_EXPIRY}`);
});
