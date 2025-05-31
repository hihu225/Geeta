// backend/services/notificationService.js
const admin = require("../utils/firebaseAdmin");
const User = require("../models/usermodels");
const geminiService = require("./geminiService");

class NotificationService {
  async sendDailyQuoteToUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken || !user.dailyQuotes.enabled) {
        return { success: false, message: "User not eligible for notifications" };
      }

      // Get quote from Gemini
      const quoteData = await geminiService.getDailyQuote(
        user.preferences.language,
        user.preferences.quoteType
      );

      if (!quoteData.success) {
        throw new Error("Failed to generate quote");
      }

      // Prepare notification message
      const message = {
        notification: {
          title: "🕉️ Daily Bhagavad Gita Wisdom",
          body: this.truncateText(quoteData.quote, 100) + "...",
        },
        data: {
          type: "daily_quote",
          fullQuote: quoteData.quote,
          language: user.preferences.language,
          timestamp: new Date().toISOString()
        },
        token: user.fcmToken
      };

      // Send notification
      const response = await admin.messaging().send(message);

      // Update user's last sent timestamp
      await User.findByIdAndUpdate(userId, {
        'dailyQuotes.lastSent': new Date()
      });

      return {
        success: true,
        response,
        quote: quoteData.quote
      };
    } catch (error) {
      console.error(`Error sending quote to user ${userId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendDailyQuotesToAllUsers() {
    try {
      const users = await User.find({
        'dailyQuotes.enabled': true,
        fcmToken: { $exists: true, $ne: null }
      });

      const results = [];
      
      for (const user of users) {
        // Check if it's time to send notification for this user
        if (this.shouldSendNotification(user)) {
          const result = await this.sendDailyQuoteToUser(user._id);
          results.push({
            userId: user._id,
            email: user.email,
            ...result
          });
          
          // Add delay between notifications to avoid rate limiting
          await this.delay(1000);
        }
      }

      return {
        success: true,
        totalUsers: users.length,
        sentNotifications: results.filter(r => r.success).length,
        results
      };
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  shouldSendNotification(user) {
    const now = new Date();
    const userTime = this.getUserCurrentTime(user.dailyQuotes.timezone);
    const scheduledTime = user.dailyQuotes.time; // "HH:MM" format
    
    const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
    
    // Check if current time matches scheduled time (within 5-minute window)
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    
    const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    const timeDiff = Math.abs(currentTotalMinutes - scheduledTotalMinutes);
    
    // Check if notification should be sent (within 5-minute window and not sent today)
    const shouldSend = timeDiff <= 5 && !this.wasSentToday(user.dailyQuotes.lastSent);
    
    return shouldSend;
  }

  wasSentToday(lastSent) {
    if (!lastSent) return false;
    
    const today = new Date();
    const lastSentDate = new Date(lastSent);
    
    return today.toDateString() === lastSentDate.toDateString();
  }

  getUserCurrentTime(timezone) {
    return new Date().toLocaleString("en-US", { timeZone: timezone });
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Send immediate quote (for testing or manual triggers)
  async sendImmediateQuote(userId, customMessage = null) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken) {
        return { success: false, message: "User or FCM token not found" };
      }

      let quoteData;
      if (customMessage) {
        quoteData = { success: true, quote: customMessage };
      } else {
        quoteData = await geminiService.getDailyQuote(
          user.preferences.language,
          user.preferences.quoteType
        );
      }

      const message = {
        notification: {
          title: "🕉️ Bhagavad Gita Wisdom",
          body: this.truncateText(quoteData.quote, 100) + "...",
        },
        data: {
          type: "instant_quote",
          fullQuote: quoteData.quote,
          timestamp: new Date().toISOString()
        },
        token: user.fcmToken
      };

      const response = await admin.messaging().send(message);
      return { success: true, response };
    } catch (error) {
      console.error("Error sending immediate quote:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();