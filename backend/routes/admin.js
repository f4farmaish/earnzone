const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Block/unblock user
router.put('/users/:id/toggle-block', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'unblocked' : 'blocked'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get site stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await User.countDocuments({ createdAt: { $gte: today } });

    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);

    const pendingWithdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId', 'username email');
    const pendingDeposits = await Transaction.find({ type: 'deposit', status: 'pending' }).populate('userId', 'username email');

    res.json({
      totalUsers,
      activeUsers,
      newToday,
      totalWithdrawn: totalWithdrawals[0]?.total || 0,
      pendingWithdrawals,
      pendingDeposits
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve/reject transaction
router.put('/transactions/:id', adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const tx = await Transaction.findById(req.params.id).populate('userId');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    tx.status = status;
    if (note) tx.note = note;

    if (status === 'completed' && tx.type === 'deposit') {
      const user = await User.findById(tx.userId);
      user.balance += tx.amount;
      await user.save();
    }

    if (status === 'rejected' && tx.type === 'withdrawal') {
      const user = await User.findById(tx.userId);
      user.balance += Math.abs(tx.amount);
      await user.save();
    }

    if (status === 'completed' && tx.type === 'withdrawal') {
      const user = await User.findById(tx.userId);
      user.totalWithdrawn += Math.abs(tx.amount);
      await user.save();
    }

    await tx.save();
    res.json({ message: 'Transaction updated', tx });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manually adjust user balance
router.put('/users/:id/balance', adminAuth, async (req, res) => {
  try {
    const { amount, note } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.balance += amount;
    await user.save();
    await Transaction.create({ userId: user._id, type: 'task', amount, status: 'completed', note: note || 'Admin adjustment' });
    res.json({ message: 'Balance updated', balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
