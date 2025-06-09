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
      
      // Enhanced user eligibility check including login status
      if (!user || !user.fcmToken || !user.dailyQuotes.enabled) {
        return { success: false, message: "User not eligible for notifications" };
      }

      // NEW: Check if user is currently logged in
      if (!this.isUserLoggedIn(user)) {
        console.log(`User ${userId} is logged out, skipping notification`);
        return { 
          success: false, 
          message: "User is logged out",
          userLoggedOut: true 
        };
      }

      // CRITICAL: Enhanced duplicate check with database verification
      const duplicateCheck = await this.checkDuplicateNotifications(userId);
      if (duplicateCheck.hasDuplicates) {
        console.log(`Duplicate notification prevented for user ${userId}: ${duplicateCheck.count} notifications already sent today`);
        return { 
          success: false, 
          message: "Daily quote already sent today (database verified)",
          alreadySent: true,
          duplicateCount: duplicateCheck.count
        };
      }

      // CRITICAL: Check if already sent today AND schedule hasn't changed since last sent
      if (this.wasSentToday(user.dailyQuotes.lastSent) && !this.scheduleChangedAfterLastSent(user)) {
        console.log(`Daily quote already sent today for user ${userId} and schedule unchanged`);
        return { 
          success: false, 
          message: "Daily quote already sent today",
          alreadySent: true 
        };
      }

      // NEW: Create a processing lock to prevent race conditions
      const lockKey = `daily_quote_${userId}_${new Date().toISOString().split('T')[0]}`;
      const existingLock = await this.checkProcessingLock(lockKey);
      if (existingLock) {
        console.log(`Processing lock exists for user ${userId}, skipping to prevent duplicate`);
        return { 
          success: false, 
          message: "Already processing notification for today",
          processingLock: true 
        };
      }

      // Set processing lock
      await this.setProcessingLock(lockKey);

      try {
        // Get quote from Gemini with user context for sequential quotes
        let quoteData = await geminiService.getDailyQuote(
          user.preferences?.language || 'english',
          user.preferences?.quoteType || 'random',
          user // Pass user object for sequential progress tracking
        );
        console.log("Gemini Quote Data:", quoteData);
        
        // If Gemini API fails, use fallback quote
        if (!quoteData.success) {
          console.warn("Gemini API failed, using fallback quote");
          quoteData = {
            success: true,
            quote: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। (You have the right to perform your actions, but you are not entitled to the fruits of action.) - Bhagavad Gita 2.47"
          };
        }

        // IMPORTANT: Update sequential progress if user is on sequential mode
        let sequentialProgress = null;
        if (user.preferences?.quoteType === 'sequential' && quoteData.success) {
          try {
            sequentialProgress = await geminiService.advanceUserSequentialVerse(user);
            console.log(`Sequential progress updated for user ${userId}:`, sequentialProgress);
          } catch (progressError) {
            console.error(`Error updating sequential progress for user ${userId}:`, progressError);
            // Continue with quote delivery even if progress update fails
          }
        }

        // Update user's last sent timestamp IMMEDIATELY to prevent race conditions
        await User.findByIdAndUpdate(userId, {
          'dailyQuotes.lastSent': new Date()
        });

        // Create notification record in database with enhanced data
        notificationRecord = new Notification({
          userId: user._id,
          title: "🕉️ Daily Bhagavad Gita Wisdom",
          body: this.truncateText(quoteData.quote, 100) + "...",
          type: "daily_quote",
          data: {
            fullQuote: quoteData.quote,
            language: user.preferences?.language || 'english',
            quoteType: user.preferences?.quoteType || 'random',
            // Add sequential progress data if applicable
            sequentialProgress: sequentialProgress ? {
              currentPosition: sequentialProgress.position,
              totalVersesRead: sequentialProgress.totalRead,
              completedChapters: sequentialProgress.completedChapters
            } : null,
            // Add parsed quote data for better tracking
            parsedQuote: quoteData.parsed || null,
            metadata: {
              generatedBy: 'gemini',
              isScheduled: true,
              sentDate: new Date().toISOString().split('T')[0], // Store date for tracking
              userProgress: quoteData.userProgress || null, // Store user's verse position
              lockKey: lockKey // Store lock key for debugging
            }
          },
          deliveryStatus: 'pending',
          priority: 'normal'
        });

        await notificationRecord.save();
        console.log(`Notification record created: ${notificationRecord._id}`);

        // Prepare enhanced FCM message with sequential progress
        const message = {
          notification: {
            title: "🕉️ Daily Bhagavad Gita Wisdom",
            body: this.truncateText(quoteData.quote, 100) + "...",
          },
          data: {
            type: "daily_quote",
            fullQuote: quoteData.quote,
            language: user.preferences?.language || 'english',
            quoteType: user.preferences?.quoteType || 'random',
            timestamp: new Date().toISOString(),
            notificationId: notificationRecord._id.toString(),
            // Add sequential progress for app to display
            ...(sequentialProgress && {
              sequentialPosition: sequentialProgress.position,
              totalVersesRead: sequentialProgress.totalRead.toString(),
              completedChapters: sequentialProgress.completedChapters.toString()
            }),
            // Add parsed data for app usage
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
            // Return sequential progress info for logging/tracking
            sequentialProgress: sequentialProgress,
            quoteType: user.preferences?.quoteType || 'random',
            userProgress: quoteData.userProgress
          };

        } catch (fcmError) {
          console.error(`FCM delivery failed for user ${userId}:`, fcmError);
          
          // Mark notification as failed but don't reset lastSent
          await notificationRecord.markAsFailed(fcmError.message);
          
          return {
            success: false,
            error: fcmError.message,
            notificationId: notificationRecord._id,
            sequentialProgress: sequentialProgress // Still return progress even if FCM failed
          };
        }
      } finally {
        // Always release the processing lock
        await this.releaseProcessingLock(lockKey);
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
      // Enhanced query to include active login status checks (adapted for your schema)
      const users = await User.find({
        'dailyQuotes.enabled': true,
        fcmToken: { $exists: true, $ne: null },
        isActive: true, // Only active accounts
        // Add conditions to filter out logged out users
        $or: [
          { lastLogin: { $gte: this.getActiveUserThreshold() } }, // Recently active users
          { 
            isDemo: true, 
            demoExpiresAt: { $gt: new Date() } // Active demo users
          }
        ]
      });

      console.log(`Found ${users.length} users eligible for daily quotes (logged in and notifications enabled)`);
      const results = [];
      let skippedLoggedOut = 0;
      let skippedDuplicate = 0;
      
      for (const user of users) {
        // Double-check login status before sending
        if (!this.isUserLoggedIn(user)) {
          console.log(`Skipping user ${user._id}: User is logged out`);
          skippedLoggedOut++;
          continue;
        }

        // Enhanced duplicate check at bulk level
        const duplicateCheck = await this.checkDuplicateNotifications(user._id);
        if (duplicateCheck.hasDuplicates) {
          console.log(`Skipping user ${user._id}: Already has ${duplicateCheck.count} notifications today`);
          skippedDuplicate++;
          continue;
        }

        // Check if it's time to send notification AND (not sent today OR schedule changed after last sent)
        if (this.shouldSendNotification(user) && 
            (!this.wasSentToday(user.dailyQuotes.lastSent) || this.scheduleChangedAfterLastSent(user))) {
          console.log(`Sending notification to user ${user._id} (${user.email})`);
          const result = await this.sendDailyQuoteToUser(user._id);
          results.push({
            userId: user._id,
            email: user.email,
            ...result
          });
          
          // Add delay between notifications to avoid rate limiting
          await this.delay(3000); // Increased delay to 3 seconds
        } else {
          console.log(`Skipping user ${user._id}: Either not time or already sent today without schedule change`);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const skippedCount = users.length - results.length;
      console.log(`Bulk notification complete: ${successCount}/${results.length} sent successfully, ${skippedCount} skipped (time/already sent), ${skippedLoggedOut} skipped (logged out), ${skippedDuplicate} skipped (duplicates)`);

      return {
        success: true,
        totalUsers: users.length,
        sentNotifications: successCount,
        skippedUsers: skippedCount,
        skippedLoggedOut: skippedLoggedOut,
        skippedDuplicate: skippedDuplicate,
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

      // Check if user is logged in for immediate quotes too (optional - you might want to allow admin testing)
      if (!this.isUserLoggedIn(user) && !customMessage) {
        return { success: false, message: "User is logged out" };
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
    }
  }

  isUserLoggedIn(user) {
    try {
      // Method 1: Check if user account is active
      if (user.isActive === false) {
        console.log(`User ${user._id} account is inactive`);
        return false;
      }

      // Method 2: Check last login time (user was active within last 7 days)
      if (user.lastLogin) {
        const daysSinceLogin = (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);
        if (daysSinceLogin > 7) {
          console.log(`User ${user._id} last login was ${daysSinceLogin.toFixed(1)} days ago - considering logged out`);
          return false;
        }
      } else {
        // If no lastLogin recorded, user might never have logged in properly
        console.log(`User ${user._id} has no lastLogin record`);
        return false;
      }
      if(user.isLoggedOut) {
        console.log(`User ${user._id} is marked as logged out`);
        return false;
      }
      // Method 3: Check if demo user and demo has expired
      if (user.isDemo && user.demoExpiresAt && new Date() > user.demoExpiresAt) {
        console.log(`User ${user._id} demo account has expired`);
        return false;
      }
      // Method 4: Check if FCM token exists (basic check)
      if (!user.fcmToken) {
        console.log(`User ${user._id} has no FCM token - likely not logged in on any device`);
        return false;
      }

      // Method 5: Check account creation vs last login (if account created but never logged in)
      if (user.createdAt && user.lastLogin) {
        const accountAge = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
        const daysSinceLogin = (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);
        
        // If account is old but user hasn't logged in recently, they might be inactive
        if (accountAge > 30 && daysSinceLogin > 14) {
          console.log(`User ${user._id} has old account (${accountAge.toFixed(1)} days) with stale login (${daysSinceLogin.toFixed(1)} days ago)`);
          return false;
        }
      }

      return true; // User is considered logged in
    } catch (error) {
      console.error(`Error checking login status for user ${user._id}:`, error);
      return false; // Default to not sending if we can't determine status
    }
  }

  // Get threshold date for active users (7 days ago)
  getActiveUserThreshold() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return threshold;
  }

  // Helper method to ensure user has sequential progress initialized
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

        // Check if user is logged in before sending scheduled notifications
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

        // Add delay to avoid rate limiting
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

        // Check login status before retrying
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
      
      // FIXED: Tighter time window - only send if within exact minute (0-1 minute window)
      const timeDifference = currentTotalMinutes - scheduledTotalMinutes;
      const shouldSend = timeDifference >= 0 && timeDifference < 1; // Changed from <= 1 to < 1
      
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
    
    // Compare dates in YYYY-MM-DD format to avoid timezone issues
    const todayString = today.toISOString().split('T')[0];
    const lastSentString = lastSentDate.toISOString().split('T')[0];
    
    const wasSent = todayString === lastSentString;
    console.log(`Checking if sent today: Today=${todayString}, LastSent=${lastSentString}, WasSent=${wasSent}`);
    
    return wasSent;
  }

  // NEW METHOD: Check if schedule was changed after last notification was sent
  scheduleChangedAfterLastSent(user) {
    try {
      // Check if scheduleUpdatedAt exists and is after lastSent
      if (!user.dailyQuotes.scheduleUpdatedAt || !user.dailyQuotes.lastSent) {
        return false;
      }
      
      const scheduleUpdated = new Date(user.dailyQuotes.scheduleUpdatedAt);
      const lastSent = new Date(user.dailyQuotes.lastSent);
      
      const changed = scheduleUpdated > lastSent;
      console.log(`Schedule change check for user ${user._id}: Schedule updated: ${scheduleUpdated}, Last sent: ${lastSent}, Changed: ${changed}`);
      
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

  // Enhanced duplicate notification checker with database verification
  async checkDuplicateNotifications(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const todayNotifications = await Notification.find({
        userId: userId,
        type: 'daily_quote',
        createdAt: {
          $gte: new Date(today + 'T00:00:00.000Z'),
          $lt: new Date(today + 'T23:59:59.999Z')
        }
      });

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

  // NEW: Processing lock methods to prevent race conditions
  async checkProcessingLock(lockKey) {
    try {
      // You can implement this using Redis, MongoDB, or in-memory cache
      // For MongoDB approach:
      const lock = await Notification.findOne({
        'data.metadata.lockKey': lockKey,
        createdAt: {
          $gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      });
      
      return !!lock;
    } catch (error) {
      console.error('Error checking processing lock:', error);
      return false;
    }
  }

  async setProcessingLock(lockKey) {
    try {
      // Store the lock key temporarily
      // This is a simple implementation - you might want to use Redis for better performance
      this.processingLocks = this.processingLocks || new Map();
      this.processingLocks.set(lockKey, Date.now());
      
      // Clean up old locks
      this.cleanupOldLocks();
    } catch (error) {
      console.error('Error setting processing lock:', error);
    }
  }

  async releaseProcessingLock(lockKey) {
    try {
      if (this.processingLocks) {
        this.processingLocks.delete(lockKey);
      }
    } catch (error) {
      console.error('Error releasing processing lock:', error);
    }
  }

  cleanupOldLocks() {
    try {
      if (!this.processingLocks) return;
      
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      for (const [key, timestamp] of this.processingLocks.entries()) {
        if (timestamp < fiveMinutesAgo) {
          this.processingLocks.delete(key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old locks:', error);
    }
  }
}

module.exports = new NotificationService();