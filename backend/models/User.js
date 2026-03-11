const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null },
  referralCount: { type: Number, default: 0 },
  validReferrals: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  balance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  withdrawCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  lastTaskReset: { type: Date, default: Date.now },
  tasksCompletedToday: { type: Number, default: 0 },
  extraTasksCompletedToday: { type: Number, default: 0 },
  lastExtraTaskReset: { type: Date, default: Date.now },
  popupDismissed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
