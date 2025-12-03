const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;
        const avatar = profile.photos[0]?.value || '';

        // Find existing user or create new one
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user with Google info
          user = await User.create({
            email,
            name,
            googleId,
            avatar,
            password: 'google-oauth-' + Math.random().toString(36), // Random password for OAuth users
            role: 'customer' // Default role
          });
        } else if (!user.googleId) {
          // Update existing user with Google ID
          user.googleId = googleId;
          if (avatar && !user.avatar) user.avatar = avatar;
          await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRY || '1h' }
        );

        // Attach token to user object for redirect
        user.token = token;
        
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
