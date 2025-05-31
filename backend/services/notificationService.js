// backend/services/notificationService.js
const admin = require("../utils/firebaseAdmin");
const User = require("../models/usermodels");
const Notification = require("../models/notificationModels");
const geminiService = require("./geminiService");
const moment = require('moment-timezone');

class NotificationService {
  async sendDailyQuoteToUser(userId) {
    let notificationRecord = null;
    
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken || !user.dailyQuotes.enabled) {
        return { success: false, message: "User not eligible for notifications" };
      }

      // Get quote from Gemini with fallback
      let quoteData = await geminiService.getDailyQuote(
        user.preferences?.language || 'english',
        user.preferences?.quoteType || 'random'
      );

      // If Gemini API fails, use fallback quote
      if (!quoteData.success) {
        console.warn("Gemini API failed, using fallback quote");
        quoteData = {
          success: true,
          quote: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। (You have the right to perform your actions, but you are not entitled to the fruits of action.) - Bhagavad Gita 2.47"
        };
      }

      // Create notification record in database FIRST
      notificationRecord = new Notification({
        userId: user._id,
        title: "🕉️ Daily Bhagavad Gita Wisdom",
        body: this.truncateText(quoteData.quote, 100) + "...",
        type: "daily_quote",
        data: {
          fullQuote: quoteData.quote,
          language: user.preferences?.language || 'english',
          quoteType: user.preferences?.quoteType || 'random',
          metadata: {
            generatedBy: 'gemini',
            isScheduled: true
          }
        },
        deliveryStatus: 'pending',
        priority: 'normal'
      });

      await notificationRecord.save();
      console.log(`Notification record created: ${notificationRecord._id}`);

      // Prepare FCM message with notification ID
      const message = {
        notification: {
          title: "🕉️ Daily Bhagavad Gita Wisdom",
          body: this.truncateText(quoteData.quote, 100) + "...",
        },
        data: {
          type: "daily_quote",
          fullQuote: quoteData.quote,
          language: user.preferences?.language || 'english',
          timestamp: new Date().toISOString(),
          notificationId: notificationRecord._id.toString() // Add notification ID for tracking
        },
        token: user.fcmToken
      };

      try {
        // Send FCM notification
        const response = await admin.messaging().send(message);
        console.log(`FCM notification sent: ${response}`);

        // Update notification record as delivered
        await notificationRecord.markAsDelivered(response);

        // Update user's last sent timestamp
        await User.findByIdAndUpdate(userId, {
          'dailyQuotes.lastSent': new Date()
        });

        return {
          success: true,
          response,
          quote: quoteData.quote,
          notificationId: notificationRecord._id
        };

      } catch (fcmError) {
        console.error(`FCM delivery failed for user ${userId}:`, fcmError);
        
        // Mark notification as failed
        await notificationRecord.markAsFailed(fcmError.message);
        
        return {
          success: false,
          error: fcmError.message,
          notificationId: notificationRecord._id
        };
      }

    } catch (error) {
      console.error(`Error sending quote to user ${userId}:`, error);
      
      // Mark notification as failed if it was created
      if (notificationRecord) {
        try {
          await notificationRecord.markAsFailed(error.message);
        } catch (updateError) {
          console.error('Failed to update notification status:', updateError);
        }
      }
      
      return {
        success: false,
        error: error.message,
        notificationId: notificationRecord?._id
      };
    }
  }

  async sendDailyQuotesToAllUsers() {
    try {
      const users = await User.find({
        'dailyQuotes.enabled': true,
        fcmToken: { $exists: true, $ne: null }
      });

      console.log(`Found ${users.length} users eligible for daily quotes`);
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

      const successCount = results.filter(r => r.success).length;
      console.log(`Bulk notification complete: ${successCount}/${results.length} sent successfully`);

      return {
        success: true,
        totalUsers: users.length,
        sentNotifications: successCount,
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

  // Send immediate quote (for testing or manual triggers)
  async sendImmediateQuote(userId, customMessage = null) {
    let notificationRecord = null;
    
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
          user.preferences?.language || 'english',
          user.preferences?.quoteType || 'random'
        );
      }

      // Create notification record
      notificationRecord = new Notification({
        userId: user._id,
        title: "🕉️ Bhagavad Gita Wisdom",
        body: this.truncateText(quoteData.quote, 100) + "...",
        type: customMessage ? "system" : "daily_quote",
        data: {
          fullQuote: quoteData.quote,
          language: user.preferences?.language || 'english',
          quoteType: user.preferences?.quoteType || 'random',
          metadata: {
            generatedBy: customMessage ? 'manual' : 'gemini',
            isScheduled: false,
            isTestNotification: true
          }
        },
        deliveryStatus: 'pending',
        priority: 'high' // Immediate notifications have higher priority
      });

      await notificationRecord.save();

      const message = {
        notification: {
          title: "🕉️ Bhagavad Gita Wisdom",
          body: this.truncateText(quoteData.quote, 100) + "...",
        },
        data: {
          type: "instant_quote",
          fullQuote: quoteData.quote,
          timestamp: new Date().toISOString(),
          notificationId: notificationRecord._id.toString()
        },
        token: user.fcmToken
      };

      try {
        const response = await admin.messaging().send(message);
        
        // Mark as delivered
        await notificationRecord.markAsDelivered(response);
        
        return { 
          success: true, 
          response,
          notificationId: notificationRecord._id 
        };
      } catch (fcmError) {
        // Mark as failed
        await notificationRecord.markAsFailed(fcmError.message);
        
        return { 
          success: false, 
          error: fcmError.message,
          notificationId: notificationRecord._id 
        };
      }

    } catch (error) {
      console.error("Error sending immediate quote:", error);
      
      if (notificationRecord) {
        try {
          await notificationRecord.markAsFailed(error.message);
        } catch (updateError) {
          console.error('Failed to update notification status:', updateError);
        }
      }
      
      return { 
        success: false, 
        error: error.message,
        notificationId: notificationRecord?._id 
      };
    }
  }

  // Create notification without sending (for scheduling)
  async createNotification(userId, title, body, type = 'system', data = {}, scheduledFor = null) {
    try {
      const notification = new Notification({
        userId,
        title,
        body,
        type,
        data,
        scheduledFor,
        deliveryStatus: scheduledFor ? 'pending' : 'pending',
        priority: data.priority || 'normal'
      });

      await notification.save();
      console.log(`Notification created: ${notification._id}`);
      
      return {
        success: true,
        notificationId: notification._id,
        notification
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send scheduled notifications
  async sendScheduledNotifications() {
    try {
      const pendingNotifications = await Notification.findPendingDeliveries();
      console.log(`Found ${pendingNotifications.length} pending notifications`);
      
      const results = [];
      
      for (const notification of pendingNotifications) {
        const user = await User.findById(notification.userId);
        
        if (!user || !user.fcmToken) {
          await notification.markAsFailed('User or FCM token not found');
          continue;
        }

        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            type: notification.type,
            notificationId: notification._id.toString(),
            ...notification.data
          },
          token: user.fcmToken
        };

        try {
          const response = await admin.messaging().send(message);
          await notification.markAsDelivered(response);
          results.push({ notificationId: notification._id, success: true });
        } catch (error) {
          await notification.markAsFailed(error.message);
          results.push({ 
            notificationId: notification._id, 
            success: false, 
            error: error.message 
          });
        }

        // Add delay to avoid rate limiting
        await this.delay(500);
      }

      return {
        success: true,
        processedCount: results.length,
        successCount: results.filter(r => r.success).length,
        results
      };
    } catch (error) {
      console.error('Error sending scheduled notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Retry failed deliveries
  async retryFailedDeliveries(maxAttempts = 3) {
    try {
      const failedNotifications = await Notification.findFailedDeliveries(maxAttempts);
      console.log(`Retrying ${failedNotifications.length} failed notifications`);
      
      const results = [];
      
      for (const notification of failedNotifications) {
        const user = await User.findById(notification.userId);
        
        if (!user || !user.fcmToken) {
          await notification.markAsFailed('User or FCM token not found');
          continue;
        }

        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            type: notification.type,
            notificationId: notification._id.toString(),
            ...notification.data
          },
          token: user.fcmToken
        };

        try {
          const response = await admin.messaging().send(message);
          await notification.markAsDelivered(response);
          results.push({ notificationId: notification._id, success: true });
        } catch (error) {
          await notification.markAsFailed(error.message);
          results.push({ 
            notificationId: notification._id, 
            success: false, 
            error: error.message 
          });
        }

        await this.delay(1000); // Longer delay for retries
      }

      return {
        success: true,
        retriedCount: results.length,
        successCount: results.filter(r => r.success).length,
        results
      };
    } catch (error) {
      console.error('Error retrying failed deliveries:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const deletedCount = await Notification.deleteOldNotifications(daysOld);
      console.log(`Cleaned up ${deletedCount} old notifications`);
      
      return {
        success: true,
        deletedCount
      };
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  shouldSendNotification(user) {
    try {
      const scheduledTime = user.dailyQuotes.time; // "HH:MM" format
      const timezone = user.dailyQuotes.timezone;
      
      // Get current time in user's timezone using moment
      const userCurrentTime = moment().tz(timezone);
      
      const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
      
      const currentHour = userCurrentTime.hour();
      const currentMinute = userCurrentTime.minute();
      
      const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      
      const timeDiff = Math.abs(currentTotalMinutes - scheduledTotalMinutes);
      
      // Check if notification should be sent (within 1-minute window and not sent today)
      const shouldSend = timeDiff <= 1;
      // && !this.wasSentToday(user.dailyQuotes.lastSent);
      
      console.log(`User ${user._id}: Current time: ${currentHour}:${currentMinute}, Scheduled: ${scheduledHour}:${scheduledMinute}, Diff: ${timeDiff} minutes, Should send: ${shouldSend}`);
      
      return shouldSend;
    } catch (error) {
      console.error(`Error checking notification time for user ${user._id}:`, error);
      return false;
    }
  }

  wasSentToday(lastSent) {
    if (!lastSent) return false;
    
    const today = new Date();
    const lastSentDate = new Date(lastSent);
    
    return today.toDateString() === lastSentDate.toDateString();
  }

  getUserCurrentTime(timezone) {
    return moment().tz(timezone).toDate();
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new NotificationService();