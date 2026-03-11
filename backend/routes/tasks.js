const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const LEVEL_CONFIG = {
  1: { dailyTasks: 5, taskEarning: 0.20 },
  2: { dailyTasks: 10, taskEarning: 0.20 },
  3: { dailyTasks: 15, taskEarning: 0.267 },
  4: { dailyTasks: 20, taskEarning: 0.40 },
  5: { dailyTasks: 25, taskEarning: 0.56 }
};

const EXTRA_TASK_EARNING = 0.40;
const EXTRA_TASKS_PER_DAY = 3;

// Complete a daily task
router.post('/complete', auth, async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const lastReset = new Date(user.lastTaskReset);

    if (now.toDateString() !== lastReset.toDateString()) {
      user.tasksCompletedToday = 0;
      user.lastTaskReset = now;
    }

    const config = LEVEL_CONFIG[user.level];
    if (user.tasksCompletedToday >= config.dailyTasks) {
      return res.status(400).json({ message: 'Daily task limit reached. Come back tomorrow!' });
    }

    user.tasksCompletedToday += 1;
    user.balance += config.taskEarning;
    user.totalEarned += config.taskEarning;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'task',
      amount: config.taskEarning,
      status: 'completed',
      note: `Daily task #${user.tasksCompletedToday} completed`
    });

    res.json({
      message: `+$${config.taskEarning.toFixed(2)} earned!`,
      tasksCompleted: user.tasksCompletedToday,
      tasksTotal: config.dailyTasks,
      balance: user.balance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete extra task
router.post('/complete-extra', auth, async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const lastReset = new Date(user.lastExtraTaskReset);

    if (now.toDateString() !== lastReset.toDateString()) {
      user.extraTasksCompletedToday = 0;
      user.lastExtraTaskReset = now;
    }

    if (user.extraTasksCompletedToday >= EXTRA_TASKS_PER_DAY) {
      return res.status(400).json({ message: 'Extra task limit reached for today!' });
    }

    user.extraTasksCompletedToday += 1;
    user.balance += EXTRA_TASK_EARNING;
    user.totalEarned += EXTRA_TASK_EARNING;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'extra_task',
      amount: EXTRA_TASK_EARNING,
      status: 'completed',
      note: `Extra task #${user.extraTasksCompletedToday} completed`
    });

    res.json({
      message: `+$${EXTRA_TASK_EARNING} earned!`,
      extraTasksCompleted: user.extraTasksCompletedToday,
      balance: user.balance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get task status
router.get('/status', auth, async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();

    const lastReset = new Date(user.lastTaskReset);
    const tasksToday = now.toDateString() === lastReset.toDateString() ? user.tasksCompletedToday : 0;

    const lastExtraReset = new Date(user.lastExtraTaskReset);
    const extraTasksToday = now.toDateString() === lastExtraReset.toDateString() ? user.extraTasksCompletedToday : 0;

    const config = LEVEL_CONFIG[user.level];

    res.json({
      tasksCompleted: tasksToday,
      tasksTotal: config.dailyTasks,
      taskEarning: config.taskEarning,
      extraTasksCompleted: extraTasksToday,
      extraTasksTotal: EXTRA_TASKS_PER_DAY,
      extraTaskEarning: EXTRA_TASK_EARNING
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
