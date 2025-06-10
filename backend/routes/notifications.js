// backend/routes/notifications.js
const express = require("express");
const admin = require("../utils/firebaseAdmin");
const auth = require("../middleware/auth");
const User = require("../models/usermodels");
const Notification = require("../models/notificationModels"); 
const notificationService = require("../services/notificationService");

const router = express.Router();

router.post("/save-token", auth, async (req, res) => {
  try {
    console.log("Incoming save-token request");
    console.log("Request body:", req.body);

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "FCM token missing" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { fcmToken: token } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update daily quote preferences
router.post("/preferences", auth, async (req, res) => {
  try {
    const { enabled, time, timezone, language, quoteType } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    let scheduleChanged = false;

    // Track if schedule-related fields are being updated
    if (enabled !== undefined) updateData["dailyQuotes.enabled"] = enabled;
    
    if (time) {
      updateData["dailyQuotes.time"] = time;
      scheduleChanged = true;
    }
    
    if (timezone) {
      updateData["dailyQuotes.timezone"] = timezone;
      scheduleChanged = true;
    }
    
    if (language) updateData["preferences.language"] = language;
    if (quoteType) updateData["preferences.quoteType"] = quoteType;

    // If time or timezone changed, update the scheduleUpdatedAt timestamp
    if (scheduleChanged) {
      updateData["dailyQuotes.scheduleUpdatedAt"] = new Date();
      console.log(`Schedule updated for user ${userId}: time=${time}, timezone=${timezone}`);
    }

    await User.findByIdAndUpdate(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      scheduleChanged: scheduleChanged
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user preferences
router.get("/preferences", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("dailyQuotes preferences");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      preferences: {
        dailyQuotes: user.dailyQuotes,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual send to all users (Admin only)
router.post("/send-all", auth, async (req, res) => {
  try {
    // Add admin check here if needed
    const result = await notificationService.sendDailyQuotesToAllUsers();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error sending to all users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy route for backward compatibility
router.post("/send", auth, async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const message = {
    notification: { title, body },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({ success: false, error });
  }
});

// Backend routes for notifications management
router.get('/user-notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/mark-read/:notificationId', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, userId: req.user.userId },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/delete/:notificationId', auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      userId: req.user.userId
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/clear-all', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
