/**
 * Authentication Routes
 * Handles user registration and login
 */

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config");
const passport = require("passport");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Create user
    try {
      const user = new User({ email, password, name });
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        config.JWT_SECRET,
        {
          expiresIn: config.JWT_EXPIRY,
        }
      );

      // Return success response with token
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRY,
      }
    );

    // Return success response with token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: config.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/google/callback
 * Google OAuth callback handler
 */
router.post("/google/callback", async (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Invalid code" });
    return;
  }

  // Exchange code for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    }),
  }).then((res) => res.json());
  if (!tokenResponse.access_token) {
    res.status(500).json({ error: "Failed to get access token" });
    return;
  }

  // Get user info from Google
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    }
  ).then((res) => res.json());
  const { email, name } = userResponse;
  if (!email) {
    res.status(400).json({ error: "No email provided" });
    return;
  }

  // Check if user exists
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, name, password: "" });
    await user.save();
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRY,
    }
  );

  // Return success response with token
  res.status(200).json({
    success: true,
    message: "Authenticated Successfully",
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
  });
});

module.exports = router;
