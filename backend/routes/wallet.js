const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const MIN_WITHDRAW = 15;

// Request withdrawal
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, bitcoinAddress } = req.body;
    const user = req.user;

    if (!bitcoinAddress) return res.status(400).json({ message: 'Bitcoin address required' });
    if (amount < MIN_WITHDRAW) return res.status(400).json({ message: `Minimum withdrawal is $${MIN_WITHDRAW}` });
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    user.balance -= amount;
    user.withdrawCount += 1;

    // Level 2 free on 2nd withdrawal
    if (user.withdrawCount === 2 && user.level < 2) {
      user.level = 2;
    }

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      bitcoinAddress,
      note: 'Withdrawal request submitted'
    });

    res.json({ message: 'Withdrawal request submitted! Admin will process within 24hrs.', balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Request deposit (manual - user sends BTC then notifies)
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, txHash } = req.body;
    const user = req.user;

    if (!txHash) return res.status(400).json({ message: 'Transaction hash required' });
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      txHash,
      note: 'Deposit pending admin verification'
    });

    res.json({ message: 'Deposit submitted! Admin will verify and credit your account.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get wallet info
router.get('/info', auth, async (req, res) => {
  try {
    const user = req.user;
    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({
      balance: user.balance,
      totalEarned: user.totalEarned,
      totalWithdrawn: user.totalWithdrawn,
      withdrawCount: user.withdrawCount,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
