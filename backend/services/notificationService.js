// backend/services/notificationService.js
const admin = require("../utils/firebaseAdmin");
const User = require("../models/usermodels");
const Notification = require("../models/notificationModels");
const geminiService = require("./geminiService");
const moment = require('moment-timezone');

class NotificationService {
  constructor() {
    // CRITICAL: Add a semaphore to prevent concurrent notifications to same user
    this.processingUsers = new Set();
  }

  async sendDailyQuoteToUser(userId) {
    // CRITICAL: Prevent concurrent processing for same user
    if (this.processingUsers.has(userId)) {
      console.log(`User ${userId} is already being processed, skipping to prevent duplicates`);
      return { 
        success: false, 
        message: "User already being processed",
        alreadyProcessing: true 
      };
    }

    // Lock this user for processing
    this.processingUsers.add(userId);
    
    let notificationRecord = null;
    
    try {
      const user = await User.findById(userId);
      
      // Enhanced user eligibility check including login status
      if (!user || !user.fcmToken || !user.dailyQuotes.enabled) {
        return { success: false, message: "User not eligible for notifications" };
      }

      // Check if user is currently logged in
      if (!this.isUserLoggedIn(user)) {
        console.log(`User ${userId} is logged out, skipping notification`);
        return { 
          success: false, 
          message: "User is logged out",
          userLoggedOut: true 
        };
      }

      // CRITICAL FIX: Enhanced duplicate check that prevents ANY daily quote today
      const duplicateCheck = await this.checkDuplicateNotifications(userId);
      const scheduleChanged = this.scheduleChangedAfterLastSent(user);
      
      // FIXED: Only allow ONE notification per day, regardless of quote type
      if (duplicateCheck.hasDuplicates && !scheduleChanged) {
        console.log(`Daily quote already sent today for user ${userId} - found ${duplicateCheck.count} existing notifications`);
        return { 
          success: false, 
          message: "Daily quote already sent today",
          alreadySent: true,
          existingNotifications: duplicateCheck.count
        };
      }

      // CRITICAL: If schedule changed, check if we already sent after the change
      if (scheduleChanged && duplicateCheck.hasDuplicates) {
        const latestNotification = duplicateCheck.notifications[0]; // Sorted by newest first
        const scheduleUpdatedAt = new Date(user.dailyQuotes.scheduleUpdatedAt);
        
        if (latestNotification.createdAt > scheduleUpdatedAt) {
          console.log(`User ${userId} already received notification after schedule change`);
          return { 
            success: false, 
            message: "Already sent notification after schedule change",
            alreadySent: true 
          };
        }
      }

      // LEGACY CHECK: Also check the old way for backward compatibility
      if (this.wasSentToday(user.dailyQuotes.lastSent) && !scheduleChanged) {
        console.log(`Daily quote already sent today for user ${userId} (legacy check) and schedule unchanged`);
        return { 
          success: false, 
          message: "Daily quote already sent today (legacy check)",
          alreadySent: true 
        };
      }

      // FIXED: Get the user's SINGLE quote preference, not multiple
      const userQuoteType = this.getUserQuoteType(user);
      
      // Get quote from Gemini with user context
      let quoteData = await geminiService.getDailyQuote(
        user.preferences?.language || 'english',
        userQuoteType,
        user // Pass user object for sequential progress tracking
      );
      console.log("Gemini Quote Data:", quoteData);
      
      // If Gemini API fails, use fallback quote
      if (!quoteData.success) {
        console.warn("Gemini API failed, using fallback quote");
        quoteData = {
          success: true,
          quote: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। (You have the right to perform your actions, but you are not entitled to the fruits of action.) - Bhagavad Gita 2.47",
          type: userQuoteType
        };
      }

      // Update sequential progress if needed
      let sequentialProgress = null;
      if (userQuoteType === 'sequential' && quoteData.success) {
        try {
          sequentialProgress = await geminiService.advanceUserSequentialVerse(user);
          console.log(`Sequential progress updated for user ${userId}:`, sequentialProgress);
        } catch (progressError) {
          console.error(`Error updating sequential progress for user ${userId}:`, progressError);
        }
      }

      // CRITICAL: Update user's last sent timestamp IMMEDIATELY to prevent race conditions
      await User.findByIdAndUpdate(userId, {
        'dailyQuotes.lastSent': new Date()
      });

      // Create notification record with the SINGLE quote type
      notificationRecord = new Notification({
        userId: user._id,
        title: "🕉️ Daily Bhagavad Gita Wisdom",
        body: this.truncateText(quoteData.quote, 100) + "...",
        type: "daily_quote",
        data: {
          fullQuote: quoteData.quote,
          language: user.preferences?.language || 'english',
          quoteType: userQuoteType, // Single quote type
          sequentialProgress: sequentialProgress ? {
            currentPosition: sequentialProgress.position,
            totalVersesRead: sequentialProgress.totalRead,
            completedChapters: sequentialProgress.completedChapters
          } : null,
          parsedQuote: quoteData.parsed || null,
          metadata: {
            generatedBy: 'gemini',
            isScheduled: true,
            sentDate: new Date().toISOString().split('T')[0],
            userProgress: quoteData.userProgress || null,
            scheduleChangeTriggered: scheduleChanged,
            originalScheduleTime: user.dailyQuotes.time,
            userTimezone: user.dailyQuotes.timezone
          }
        },
        deliveryStatus: 'pending',
        priority: 'normal'
      });

      await notificationRecord.save();
      console.log(`Notification record created: ${notificationRecord._id}`);

      // Prepare FCM message
      const message = {
        notification: {
          title: "🕉️ Daily Bhagavad Gita Wisdom",
          body: this.truncateText(quoteData.quote, 100) + "...",
        },
        data: {
          type: "daily_quote",
          fullQuote: quoteData.quote,
          language: user.preferences?.language || 'english',
          quoteType: userQuoteType,
          timestamp: new Date().toISOString(),
          notificationId: notificationRecord._id.toString(),
          ...(sequentialProgress && {
            sequentialPosition: sequentialProgress.position,
            totalVersesRead: sequentialProgress.totalRead.toString(),
            completedChapters: sequentialProgress.completedChapters.toString()
          }),
          ...(quoteData.parsed && {
            verse: quoteData.parsed.verse || '',
            sanskrit: quoteData.parsed.sanskrit || '',
            translation: quoteData.parsed.translation || '',
            wisdom: quoteData.parsed.wisdom || ''
          })
        },
        token: user.fcmToken
      };

      try {
        // Send FCM notification
        const response = await admin.messaging().send(message);
        console.log(`FCM notification sent successfully to user ${userId}: ${response}`);

        // Update notification record as delivered
        await notificationRecord.markAsDelivered(response);

        return {
          success: true,
          response,
          quote: quoteData.quote,
          notificationId: notificationRecord._id,
          sequentialProgress: sequentialProgress,
          quoteType: userQuoteType,
          userProgress: quoteData.userProgress,
          scheduleChangeTriggered: scheduleChanged
        };

      } catch (fcmError) {
        console.error(`FCM delivery failed for user ${userId}:`, fcmError);
        await notificationRecord.markAsFailed(fcmError.message);
        
        return {
          success: false,
          error: fcmError.message,
          notificationId: notificationRecord._id,
          sequentialProgress: sequentialProgress
        };
      }

    } catch (error) {
      console.error(`Error sending quote to user ${userId}:`, error);
      
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
    } finally {
      // CRITICAL: Always remove user from processing set
      this.processingUsers.delete(userId);
    }
  }

  // CRITICAL: New method to determine user's single quote preference
  getUserQuoteType(user) {
    // Priority order: user preference > default
    if (user.preferences?.quoteType) {
      return user.preferences.quoteType;
    }
    
    // Check if user has any specific preferences set
    if (user.preferences?.categories && user.preferences.categories.length > 0) {
      // Map categories to quote types
      const categoryMap = {
        'life_guidance': 'themed',
        'sacred_journey': 'themed',
        'spiritual_growth': 'themed',
        'daily_wisdom': 'random'
      };
      
      // Use the first category preference
      const firstCategory = user.preferences.categories[0];
      return categoryMap[firstCategory] || 'random';
    }
    
    // Default fallback
    return 'random';
  }

  async sendDailyQuotesToAllUsers() {
    try {
      // Enhanced query to include active login status checks
      const users = await User.find({
        'dailyQuotes.enabled': true,
        fcmToken: { $exists: true, $ne: null },
        isActive: true,
        $or: [
          { lastLogin: { $gte: this.getActiveUserThreshold() } },
          { 
            isDemo: true, 
            demoExpiresAt: { $gt: new Date() }
          }
        ]
      });

      console.log(`Found ${users.length} users eligible for daily quotes (logged in and notifications enabled)`);
      const results = [];
      let skippedLoggedOut = 0;
      let skippedAlreadySent = 0;
      
      for (const user of users) {
        // Double-check login status
        if (!this.isUserLoggedIn(user)) {
          console.log(`Skipping user ${user._id}: User is logged out`);
          skippedLoggedOut++;
          continue;
        }

        // CRITICAL: Check if user is already being processed
        if (this.processingUsers.has(user._id.toString())) {
          console.log(`Skipping user ${user._id}: Already being processed`);
          skippedAlreadySent++;
          continue;
        }

        // Enhanced duplicate prevention
        const duplicateCheck = await this.checkDuplicateNotifications(user._id);
        const scheduleChanged = this.scheduleChangedAfterLastSent(user);
        
        // Check if it's time to send notification
        const isTimeToSend = this.shouldSendNotification(user);
        
        // Comprehensive check for whether to send
        const shouldSend = isTimeToSend && (!duplicateCheck.hasDuplicates || scheduleChanged);
        
        if (shouldSend) {
          // Additional check for schedule change
          if (scheduleChanged && duplicateCheck.hasDuplicates) {
            const latestNotification = duplicateCheck.notifications[0];
            const scheduleUpdatedAt = new Date(user.dailyQuotes.scheduleUpdatedAt);
            
            if (latestNotification.createdAt > scheduleUpdatedAt) {
              console.log(`Skipping user ${user._id}: Already sent after schedule change`);
              skippedAlreadySent++;
              continue;
            }
          }
          
          console.log(`Sending notification to user ${user._id} (${user.email}) - Schedule changed: ${scheduleChanged}, Existing notifications: ${duplicateCheck.count}`);
          const result = await this.sendDailyQuoteToUser(user._id);
          results.push({
            userId: user._id,
            email: user.email,
            ...result
          });
          
          // Add delay between notifications
          await this.delay(2000);
        } else {
          const reason = !isTimeToSend ? 'not time yet' : 'already sent today';
          console.log(`Skipping user ${user._id}: ${reason} (existing notifications: ${duplicateCheck.count})`);
          skippedAlreadySent++;
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalSkipped = users.length - results.length;
      
      console.log(`Bulk notification complete: ${successCount}/${results.length} sent successfully, ${totalSkipped} total skipped (${skippedLoggedOut} logged out, ${skippedAlreadySent} already sent/not time)`);

      return {
        success: true,
        totalUsers: users.length,
        sentNotifications: successCount,
        skippedUsers: totalSkipped,
        skippedLoggedOut: skippedLoggedOut,
        skippedAlreadySent: skippedAlreadySent,
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

  // Rest of your methods remain the same...
  async sendImmediateQuote(userId, customMessage = null) {
    // Check if already processing
    if (this.processingUsers.has(userId)) {
      return { success: false, message: "User already being processed" };
    }

    this.processingUsers.add(userId);
    let notificationRecord = null;
    
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken) {
        return { success: false, message: "User or FCM token not found" };
      }

      if (!this.isUserLoggedIn(user) && !customMessage) {
        return { success: false, message: "User is logged out" };
      }

      let quoteData;
      if (customMessage) {
        quoteData = { success: true, quote: customMessage };
      } else {
        const userQuoteType = this.getUserQuoteType(user);
        quoteData = await geminiService.getDailyQuote(
          user.preferences?.language || 'english',
          userQuoteType
        );
      }

      notificationRecord = new Notification({
        userId: user._id,
        title: "🕉️ Bhagavad Gita Wisdom",
        body: this.truncateText(quoteData.quote, 100) + "...",
        type: customMessage ? "system" : "instant_quote",
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
        priority: 'high'
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
        await notificationRecord.markAsDelivered(response);
        
        return { 
          success: true, 
          response,
          notificationId: notificationRecord._id 
        };
      } catch (fcmError) {
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
    } finally {
      this.processingUsers.delete(userId);
    }
  }

  isUserLoggedIn(user) {
    try {
      if (user.isActive === false) {
        console.log(`User ${user._id} account is inactive`);
        return false;
      }

      if (user.lastLogin) {
        const daysSinceLogin = (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);
        if (daysSinceLogin > 7) {
          console.log(`User ${user._id} last login was ${daysSinceLogin.toFixed(1)} days ago - considering logged out`);
          return false;
        }
      } else {
        console.log(`User ${user._id} has no lastLogin record`);
        return false;
      }
      
      if(user.isLoggedOut) {
        console.log(`User ${user._id} is marked as logged out`);
        return false;
      }
      
      if (user.isDemo && user.demoExpiresAt && new Date() > user.demoExpiresAt) {
        console.log(`User ${user._id} demo account has expired`);
        return false;
      }
      
      if (!user.fcmToken) {
        console.log(`User ${user._id} has no FCM token - likely not logged in on any device`);
        return false;
      }

      if (user.createdAt && user.lastLogin) {
        const accountAge = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
        const daysSinceLogin = (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);
        
        if (accountAge > 30 && daysSinceLogin > 14) {
          console.log(`User ${user._id} has old account (${accountAge.toFixed(1)} days) with stale login (${daysSinceLogin.toFixed(1)} days ago)`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`Error checking login status for user ${user._id}:`, error);
      return false;
    }
  }

  getActiveUserThreshold() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return threshold;
  }

  async initializeSequentialProgressIfNeeded(user) {
    if (!user.sequentialProgress || 
        !user.sequentialProgress.currentChapter || 
        !user.sequentialProgress.currentVerse) {
      
      user.sequentialProgress = {
        currentChapter: 1,
        currentVerse: 1,
        lastUpdated: new Date(),
        completedChapters: [],
        totalVersesRead: 0
      };
      
      await user.save();
      console.log(`Initialized sequential progress for user ${user._id}`);
    }
  }

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

        if (!this.isUserLoggedIn(user)) {
          await notification.markAsFailed('User is logged out');
          console.log(`Skipping scheduled notification for logged out user ${user._id}`);
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

        await this.delay(1000);
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

        if (!this.isUserLoggedIn(user)) {
          await notification.markAsFailed('User is logged out');
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

        await this.delay(1000);
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
      const scheduledTime = user.dailyQuotes.time;
      const timezone = user.dailyQuotes.timezone;
      
      const userCurrentTime = moment().tz(timezone);
      
      const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
      
      const currentHour = userCurrentTime.hour();
      const currentMinute = userCurrentTime.minute();
      
      const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      
      const timeDifference = currentTotalMinutes - scheduledTotalMinutes;
      const shouldSend = timeDifference >= 0 && timeDifference < 1;
      
      console.log(`User ${user._id}: Current time: ${currentHour}:${currentMinute}, Scheduled: ${scheduledHour}:${scheduledMinute}, Diff: ${timeDifference} minutes, Should send: ${shouldSend}`);
      
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
    
    const todayString = today.toISOString().split('T')[0];
    const lastSentString = lastSentDate.toISOString().split('T')[0];
    
    const wasSent = todayString === lastSentString;
    console.log(`Checking if sent today: Today=${todayString}, LastSent=${lastSentString}, WasSent=${wasSent}`);
    
    return wasSent;
  }

  scheduleChangedAfterLastSent(user) {
    try {
      if (!user.dailyQuotes.scheduleUpdatedAt || !user.dailyQuotes.lastSent) {
        return false;
      }
      
      const scheduleUpdated = new Date(user.dailyQuotes.scheduleUpdatedAt);
      const lastSent = new Date(user.dailyQuotes.lastSent);
      
      const changed = scheduleUpdated > lastSent;
      console.log(`Schedule change check for user ${user._id}: Schedule updated: ${scheduleUpdated.toISOString()}, Last sent: ${lastSent.toISOString()}, Changed: ${changed}`);
      
      return changed;
    } catch (error) {
      console.error(`Error checking schedule change for user ${user._id}:`, error);
      return false;
    }
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

  // FIXED: This method now correctly prevents ALL duplicate daily quotes
  async checkDuplicateNotifications(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check for ALL daily quote notifications today
      const todayNotifications = await Notification.find({
        userId: userId,
        type: 'daily_quote',
        createdAt: {
          $gte: new Date(today + 'T00:00:00.000Z'),
          $lt: new Date(today + 'T23:59:59.999Z')
        }
      }).sort({ createdAt: -1 });

      console.log(`Duplicate check for user ${userId}: Found ${todayNotifications.length} daily_quote notifications today`);
      
      if (todayNotifications.length > 0) {
        const quoteTypes = todayNotifications.map(n => n.data?.quoteType || 'unknown');
        console.log(`Existing quote types today for user ${userId}:`, quoteTypes);
      }

      return {
        hasDuplicates: todayNotifications.length > 0,
        count: todayNotifications.length,
        notifications: todayNotifications
      };
    } catch (error) {
      console.error('Error checking duplicate notifications:', error);
      return { hasDuplicates: false, count: 0, notifications: [] };
    }
  }
}

module.exports = new NotificationService();