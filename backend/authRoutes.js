const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const User = require('./models/usermodels');
const auth = require('./middleware/auth');
const router = express.Router();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, firebaseUid, isDemo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Only true demo accounts (explicit isDemo flag) get the TTL expiry.
    // Regular Firebase-verified signups must NOT set demoExpiresAt.
    const isDemoAccount = Boolean(isDemo);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password, // hashed via pre-save middleware
      firebaseUid: firebaseUid || null,
      isDemo: isDemoAccount,
      isVerified: true,
      isLoggedOut: false,
      lastLogin: new Date(),
      demoExpiresAt: isDemoAccount ? new Date(Date.now() + 60 * 60 * 1000) : null,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, isDemo: user.isDemo },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: isDemoAccount ? 'Demo account created successfully' : 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isDemo: user.isDemo,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, firebaseToken, rememberMe } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!firebaseToken && !password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email not found'
      });
    }

    // If firebase token is provided, it means email is verified
    // For regular password login (for existing users or demo accounts)
    if (!firebaseToken) {
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // UPDATE: Set login state and update last login
    user.lastLogin = new Date();
    user.isLoggedOut = false;
    await user.save();

    // Generate JWT token with different expiry based on rememberMe
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // UPDATE: Set logout state in database
    const user = await User.findById(req.user.userId);
    if (user) {
      user.isLoggedOut = true;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name.trim();
    
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/update-fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
router.post('/update-fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.userId;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // UPDATE: Set FCM token and update timestamp
    user.fcmToken = fcmToken;
    user.fcmTokenUpdatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'FCM token updated successfully'
    });

  } catch (error) {
    console.error('FCM token update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/delete-account
// @desc    Delete user account and all associated data
// @access  Private
router.post('/delete-account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password for security (skip for demo accounts)
    if (!user.isDemo) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to delete account'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Delete all user's chats
    const Chat = require('mongoose').model('Chat');
    await Chat.deleteMany({ userId: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;