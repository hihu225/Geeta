// backend/services/scheduler.js
const cron = require('node-cron');
const notificationService = require('./notificationService');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    // Run every 1 minutes to check for scheduled notifications
    const cronJob = cron.schedule('*/1 * * * *', async () => {
      console.log('Checking for scheduled notifications...');
      try {
        const result = await notificationService.sendDailyQuotesToAllUsers();
        console.log(`Notification check completed: ${result.sentNotifications}/${result.totalUsers} notifications sent`);
      } catch (error) {
        console.error('Scheduler error:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('dailyQuotes', cronJob);
    console.log('Daily quotes scheduler started');
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