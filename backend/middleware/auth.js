

const jwt = require('jsonwebtoken');
const config = require('../config');


const authMiddleware = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header is required.'
      });
    }

    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use "Bearer <token>"'
      });
    }

    
    const token = authHeader.substring(7); 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is empty'
      });
    }

    
    try {
      
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      
      req.user = {
        id: decoded.id,
        email: decoded.email
      };

      
      next();
    } catch (jwtError) {
     
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Authentication failed.'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

module.exports = authMiddleware;
