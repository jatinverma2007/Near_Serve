/**
 * User Routes
 * Handles user-related operations like setting role
 */

const express = require('express');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * PUT /api/users/set-role
 * Set user role (customer or provider)
 * Protected route - requires authentication
 */
router.put('/set-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!role || !['customer', 'provider'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "customer" or "provider"'
      });
    }

    // Get user from request (set by authMiddleware)
    const userId = req.user.id;

    // Update user role
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `Role updated to ${role} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
});

/**
 * GET /api/users/me
 * Get current user profile
 * Protected route - requires authentication
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

module.exports = router;
