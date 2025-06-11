const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Type of notification
  type: {
    type: String,
    enum: ['daily_quote', 'reminder', 'system', 'announcement', 'personalized'],
    default: 'daily_quote',
    index: true
  },
  
  // Additional data payload
  data: {
    // Full quote content for daily quotes
    fullQuote: {
      type: String,
      default: null
    },
    
    // Verse reference
    verse: {
      chapter: {
        type: Number,
        default: null
      },
      verseNumber: {
        type: Number,
        default: null
      }
    },
    
    // Language of the notification
    language: {
      type: String,
      enum: ['english', 'hindi', 'sanskrit'],
      default: 'english'
    },
    
    // Quote type for daily quotes
    quoteType: {
      type: String,
      enum: ['random', 'sequential', 'themed', 'personalized'],
      default: 'random'
    },
    
    // Action URL (for redirecting when clicked)
    actionUrl: {
      type: String,
      default: null
    },
    
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // When it was read
  readAt: {
    type: Date,
    default: null
  },
  
  // FCM message ID (for tracking)
  fcmMessageId: {
    type: String,
    default: null
  },
  
  // Delivery status
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending',
    index: true
  },
  
  // Error message if delivery failed
  errorMessage: {
    type: String,
    default: null
  },
  
  // Scheduled delivery time (for future notifications)
  scheduledFor: {
    type: Date,
    default: null,
    index: true
  },
  
  // Delivery attempt count
  deliveryAttempts: {
    type: Number,
    default: 0
  },
  
  // Last delivery attempt
  lastDeliveryAttempt: {
    type: Date,
    default: null
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Expiry date (auto-delete after this date)
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'notifications'
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ deliveryStatus: 1, scheduledFor: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for checking if notification is recent (within last 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInMinutes = Math.floor((now - this.createdAt) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
};

notificationSchema.methods.markAsDelivered = function(fcmMessageId = null) {
  this.deliveryStatus = 'delivered';
  this.fcmMessageId = fcmMessageId;
  this.lastDeliveryAttempt = new Date();
};

notificationSchema.methods.markAsFailed = function(errorMessage) {
  this.deliveryStatus = 'failed';
  this.errorMessage = errorMessage;
  this.deliveryAttempts += 1;
  this.lastDeliveryAttempt = new Date();
};

notificationSchema.methods.toClientObject = function() {
  const obj = this.toObject();
  obj.timeAgo = this.timeAgo;
  obj.isRecent = this.isRecent;
  return obj;
};

// Static methods
notificationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({ userId, isRead: false }).sort({ createdAt: -1 });
};

notificationSchema.statics.findByUserAndType = function(userId, type) {
  return this.find({ userId, type }).sort({ createdAt: -1 });
};

notificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.deleteOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: cutoffDate } });
};

notificationSchema.statics.getUnreadCountByUser = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.findPendingDeliveries = function() {
  return this.find({
    deliveryStatus: 'pending',
    $or: [
      { scheduledFor: null },
      { scheduledFor: { $lte: new Date() } }
    ]
  }).sort({ priority: -1, createdAt: 1 });
};

notificationSchema.statics.findFailedDeliveries = function(maxAttempts = 3) {
  return this.find({
    deliveryStatus: 'failed',
    deliveryAttempts: { $lt: maxAttempts }
  }).sort({ lastDeliveryAttempt: 1 });
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Trim whitespace from text fields
  if (this.title) this.title = this.title.trim();
  if (this.body) this.body = this.body.trim();
  
  // Set delivery status to sent when first created
  if (this.isNew && !this.deliveryStatus) {
    this.deliveryStatus = 'pending';
  }
  
  next();
});

// Post-save middleware for logging
notificationSchema.post('save', function(doc) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Notification saved: ${doc._id} for user ${doc.userId}`);
  }
});

// Create and export the model
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;