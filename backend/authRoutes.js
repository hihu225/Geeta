const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const User = require('./models/usermodels');
const auth = require('./middleware/auth');
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const OTPModel = require('./models/otp-models');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, otp, skipOTP } = req.body;

    // Check if it's a demo signup (skipOTP = true)
    if (!skipOTP && !otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Only verify OTP if not a demo account
    if (!skipOTP) {
      // Find OTP
      const otpRecord = await OTPModel.findOne({
        email: email.toLowerCase(),
        otp
      });

      if (!otpRecord || otpRecord.expiresAt < Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // OTP is valid — delete the OTP record
      await OTPModel.deleteOne({ _id: otpRecord._id });
    }

    // Create the new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password, // User model should handle hashing via pre-save middleware
      isDemo: skipOTP || false,
      isVerified: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: skipOTP ? 'Demo account created successfully' : 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isDemo: user.isDemo || false,
        createdAt: user.createdAt
      }
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
    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token with different expiry based on rememberMe
    const tokenExpiry = rememberMe ? '30d' : '1d';
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
router.post('/logout', auth, (req, res) => {
  // Since we're using JWT, logout is handled client-side
  // This endpoint is mainly for logging purposes
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
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

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOTP();
    const otpExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetOTP = otp;
    user.resetOTPExpire = otpExpire;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Password Reset OTP",
      html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 15 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.resetOTP !== otp || Date.now() > user.resetOTPExpire) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ success: true, message: "OTP verified" });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.resetOTP !== otp || Date.now() > user.resetOTPExpire) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTPModel.findOneAndDelete({ email }); // clear any previous OTPs

    await OTPModel.create({
      email,
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // expires in 15 minutes
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 15 minutes.</p>`
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = await OTPModel.findOne({ email });

    if (!record) return res.status(400).json({ message: "No OTP found. Please request again." });

    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > record.expiresAt) {
      await OTPModel.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    await OTPModel.deleteOne({ email });

    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;