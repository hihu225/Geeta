// backend/services/scheduler.js
const cron = require('node-cron');
const notificationService = require('./notificationService');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
  if (process.env.RUN_CRON !== 'true') {
    console.log('Cron scheduler disabled on this instance.');
    return;
  }

  let isRunning = false;

  const cronJob = cron.schedule('*/1 * * * *', async () => {
    if (isRunning) {
      console.log('Previous notification job still running. Skipping this cycle.');
      return;
    }

    console.log('Checking for scheduled notifications...');
    isRunning = true;
    try {
      const result = await notificationService.sendDailyQuotesToAllUsers();
      console.log(`Notification check completed: ${result.sentNotifications}/${result.totalUsers} notifications sent`);
    } catch (error) {
      console.error('Scheduler error:', error);
    } finally {
      isRunning = false;
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  this.jobs.set('dailyQuotes', cronJob);
  console.log('Daily quotes scheduler started');
}


  // Optional: Add specific time-based scheduling
  addUserSpecificJob(userId, time, timezone) {
    const [hour, minute] = time.split(':');
    const cronExpression = `${minute} ${hour} * * *`;
    
    const jobKey = `user_${userId}`;
    
    // Remove existing job if any
    if (this.jobs.has(jobKey)) {
      this.jobs.get(jobKey).stop();
      this.jobs.delete(jobKey);
    }

    // Create new job
    const job = cron.schedule(cronExpression, async () => {
      console.log(`Sending scheduled quote to user ${userId}`);
      await notificationService.sendDailyQuoteToUser(userId);
    }, {
      scheduled: true,
      timezone: timezone
    });

    this.jobs.set(jobKey, job);
    console.log(`Scheduled job created for user ${userId} at ${time} (${timezone})`);
  }

  removeUserJob(userId) {
    const jobKey = `user_${userId}`;
    if (this.jobs.has(jobKey)) {
      this.jobs.get(jobKey).stop();
      this.jobs.delete(jobKey);
      console.log(`Removed scheduled job for user ${userId}`);
    }
  }

  stop() {
    this.jobs.forEach((job, key) => {
      job.stop();
      console.log(`Stopped job: ${key}`);
    });
    this.jobs.clear();
  }

  getActiveJobs() {
    return Array.from(this.jobs.keys());
  }
}

module.exports = new Scheduler();