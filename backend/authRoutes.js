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
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, otp, skipOTP } = req.body;
    
    console.log('Signup request:', { name, email, skipOTP }); // Debug log

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
      isDemo: Boolean(skipOTP), // Fix: Ensure proper boolean conversion
      isVerified: true,
      demoExpiresAt: skipOTP ? new Date(Date.now() + 60 * 60 * 1000) : null // 1 hour for demo accounts
    });

    await user.save();
    console.log('User created:', { id: user._id, isDemo: user.isDemo }); // Debug log

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isDemo: user.isDemo }, // Include isDemo in token
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
        isDemo: user.isDemo, // This should now be true for demo accounts
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
  subject: '🕉️ Welcome to Geeta GPT - Verify Your Email', 
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Geeta GPT</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 30px; text-align: center;">
                <div style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 8px;">
                    🕉️ Geeta GPT
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 16px;">
                    Ancient Wisdom, Modern Intelligence
                </div>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px; text-align: center;">
                    Welcome to Your Spiritual Journey! 🙏
                </h2>
                
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Namaste! We're delighted to have you join the Geeta GPT community. You're just one step away from accessing timeless wisdom from the Bhagavad Gita.
                </p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: white; font-size: 18px; margin-bottom: 15px;">
                        Your verification code is:
                    </p>
                    <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <span style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 15px;">
                        ⏰ This code will expire in 15 minutes
                    </p>
                </div>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #ff6b35; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0; font-size: 18px;">
                        📚 What awaits you:
                    </h3>
                    <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                        <li>Personalized spiritual guidance from the Bhagavad Gita</li>
                        <li>Daily wisdom and inspirational verses</li>
                        <li>AI-powered insights into life's deeper questions</li>
                        <li>A community of seekers on the path of knowledge</li>
                    </ul>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    If you didn't request this verification, you can safely ignore this email. The code will expire automatically.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #2c3e50; padding: 25px 30px; text-align: center;">
                <p style="color: #bdc3c7; font-size: 14px; margin: 0 0 10px 0;">
                    "You have the right to perform your actions, but you are not entitled to the fruits of your actions."
                </p>
                <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                    - Bhagavad Gita 2.47
                </p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #34495e;">
                    <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                        © 2024 Geeta GPT. Spreading wisdom, one verse at a time.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  ` 
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

    // Delete any remaining OTP records for this user
    await OTPModel.deleteMany({ email: user.email });

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
// @route   POST /api/auth/send-delete-otp
// @desc    Send OTP for account deletion (when password is forgotten)
// @access  Private
router.post('/send-delete-otp', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store OTP in user record for account deletion
    user.deleteOTP = otp;
    user.deleteOTPExpire = otpExpire;
    await user.save();

    // Send email
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
  subject: "Farewell from Geeta GPT - Account Deletion Confirmation",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <!-- Header -->
      <div style="background: white; border-radius: 10px 10px 0 0; padding: 30px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 10px;">🕉️</div>
        <h1 style="color: #333; margin: 0; font-size: 24px;">Geeta GPT</h1>
        <h2 style="color: #dc2626; margin: 20px 0 10px 0;">⚠️ Account Deletion Request</h2>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>It is with a heavy heart that we process your request to delete your account. As the Gita teaches us about impermanence, we understand all journeys must end.</p>
        
        <p>To confirm this action, please use the OTP below:</p>
        
        <!-- OTP Section -->
        <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0;">
          <h3 style="color: #dc2626; font-size: 36px; margin: 0; letter-spacing: 4px; font-family: monospace;">${otp}</h3>
          <p style="margin: 10px 0 0 0; color: #991b1b; font-size: 12px;">Valid for 15 minutes</p>
        </div>

        <!-- Warning -->
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong></p>
          <ul style="color: #856404; margin: 10px 0 0 0;">
            <li>Account deletion is permanent and cannot be undone</li>
            <li>All your spiritual conversations will be permanently removed</li>
            <li>Your personalized wisdom journey will end</li>
          </ul>
        </div>

        <!-- Farewell -->
        <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1565c0; font-style: italic;">
            🙏 <strong>Farewell Message:</strong> The wisdom we've shared remains eternal within you. May you find peace and enlightenment in all your future endeavors.
          </p>
          <p style="text-align: center; margin: 15px 0 0 0; color: #1976d2;"><strong>🕉️ Om Shanti 🕉️</strong></p>
        </div>

        <p style="font-size: 14px; color: #666;">If you did not request this deletion, please ignore this email and your account will remain safe.</p>
        
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
          With gratitude, <strong>The Geeta GPT Team</strong><br>
          This is an automated message. Please do not reply.
        </p>
      </div>
    </div>
  `
};

await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: 'Account deletion OTP sent to your email'
    });

  } catch (error) {
    console.error('Send delete OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/verify-delete-otp
// @desc    Verify OTP and delete account
// @access  Private
router.post('/verify-delete-otp', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.userId;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    if (!user.deleteOTP || user.deleteOTP !== otp || Date.now() > user.deleteOTPExpire) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Delete all user's chats
    const Chat = require('mongoose').model('Chat');
    await Chat.deleteMany({ userId: userId });

    // Delete any OTP records for this user
    await OTPModel.deleteMany({ email: user.email });

    // Store user email for confirmation message before deletion
    const userEmail = user.email;
    const userName = user.name;

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Send confirmation email (optional)
    try {
      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Account Successfully Deleted",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669; text-align: center;">✅ Account Deleted Successfully</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Your account has been successfully deleted from our system.</p>
            <p>All your data, including chats and personal information, has been permanently removed.</p>
            <p>Thank you for using our service. We're sorry to see you go!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });

  } catch (error) {
    console.error('Verify delete OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/cancel-delete-request
// @desc    Cancel account deletion request (clear delete OTP)
// @access  Private
router.post('/cancel-delete-request', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear delete OTP fields
    user.deleteOTP = undefined;
    user.deleteOTPExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Account deletion request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;