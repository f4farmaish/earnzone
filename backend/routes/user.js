const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const LEVEL_CONFIG = {
  1: { price: 0, dailyTasks: 5, dailyEarning: 1.00, taskEarning: 0.20 },
  2: { price: 20, dailyTasks: 10, dailyEarning: 2.00, taskEarning: 0.20 },
  3: { price: 40, dailyTasks: 15, dailyEarning: 4.00, taskEarning: 0.267 },
  4: { price: 80, dailyTasks: 20, dailyEarning: 8.00, taskEarning: 0.40 },
  5: { price: 100, dailyTasks: 25, dailyEarning: 14.00, taskEarning: 0.56 }
};

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const lastReset = new Date(user.lastTaskReset);
    if (now.toDateString() !== lastReset.toDateString()) {
      user.tasksCompletedToday = 0;
      user.lastTaskReset = now;
      await user.save();
    }
    const lastExtraReset = new Date(user.lastExtraTaskReset);
    if (now.toDateString() !== lastExtraReset.toDateString()) {
      user.extraTasksCompletedToday = 0;
      user.lastExtraTaskReset = now;
      await user.save();
    }
    res.json({ user, levelConfig: LEVEL_CONFIG });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upgrade level by paying
router.post('/upgrade-level', auth, async (req, res) => {
  try {
    const { targetLevel } = req.body;
    const user = req.user;
    const config = LEVEL_CONFIG[targetLevel];
    if (!config) return res.status(400).json({ message: 'Invalid level' });
    if (targetLevel <= user.level) return res.status(400).json({ message: 'Already at this level or higher' });
    if (user.balance < config.price) return res.status(400).json({ message: 'Insufficient balance' });

    user.balance -= config.price;
    user.level = targetLevel;
    await user.save();

    await Transaction.create({ userId: user._id, type: 'level_upgrade', amount: -config.price, status: 'completed', note: `Upgraded to Level ${targetLevel}` });
    res.json({ message: `Upgraded to Level ${targetLevel}!`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get referrals
router.get('/referrals', auth, async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id }).select('username createdAt level isActive');
    res.json({ referrals, referralCode: req.user.referralCode, validReferrals: req.user.validReferrals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.LEVEL_CONFIG = LEVEL_CONFIG;
