// backend/routes/notifications.js
const express = require("express");
const admin = require("../utils/firebaseAdmin");
const auth = require("../middleware/auth");
const User = require("../models/usermodels");
const notificationService = require("../services/notificationService");

const router = express.Router();

router.post("/save-token", auth, async (req, res) => {
  try {
    console.log("Incoming save-token request");
    console.log("User ID:", req.user.id);
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
    const userId = req.user.id;

    const updateData = {};
    if (enabled !== undefined) updateData["dailyQuotes.enabled"] = enabled;
    if (time) updateData["dailyQuotes.time"] = time;
    if (timezone) updateData["dailyQuotes.timezone"] = timezone;
    if (language) updateData["preferences.language"] = language;
    if (quoteType) updateData["preferences.quoteType"] = quoteType;

    await User.findByIdAndUpdate(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user preferences
router.get("/preferences", auth, async (req, res) => {
  try {
    const userId = req.user.id;
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

// Send immediate quote (for testing)
router.post("/send-quote", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { customMessage } = req.body;

    const result = await notificationService.sendImmediateQuote(
      userId,
      customMessage
    );

    if (result.success) {
      res
        .status(200)
        .json({ success: true, message: "Quote sent successfully" });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error sending quote:", error);
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

module.exports = router;
