const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/usermodels');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token payload',
        });
      }

      // Check if user still exists
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }
      // Check if user is logged out
if (user.isLoggedOut) {
  return res.status(401).json({
    success: false,  
    message: 'User is logged out. Please login again.'
  });
}

// Check if demo account has expired
if (user.isDemo && user.demoExpiresAt && new Date() > user.demoExpiresAt) {
  return res.status(401).json({
    success: false,
    message: 'Demo account has expired'
  });
}
      // Add user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired, please login again'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else {
        throw jwtError;
      }
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = auth;