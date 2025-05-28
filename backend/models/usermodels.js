const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ADD THESE MISSING FIELDS:
  isDemo: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  resetOTP: String,
  resetOTPExpire: Date,
  deleteOTP: {
    type: String,
    default: undefined
  },
  deleteOTPExpire: {
    type: Date,
    default: undefined
  },
  demoExpiresAt: { type: Date, default: null }
}, {
  timestamps: true
});
userSchema.index({ demoExpiresAt: 1 }, { expireAfterSeconds: 0 });
// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};
userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    await Promise.all([
      mongoose.model("Chat").deleteMany({ userId: user._id }),
      mongoose.model("Theme").deleteMany({ userId: user._id })
    ]);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
