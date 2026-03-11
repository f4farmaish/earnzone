const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

router.get('/cpx', async (req, res) => {
  try {
    const { status, trans_id, user_id, amount_usd, hash } = req.query;

    // Verify hash (get your secret hash from CPX Research dashboard)
    const CPX_SECRET = process.env.CPX_SECRET || 'your_cpx_secret_hash';
    const expectedHash = crypto.md5 ? 
      crypto.createHash('md5').update(trans_id + CPX_SECRET).digest('hex') :
      crypto.createHash('md5').update(trans_id + CPX_SECRET).digest('hex');

    if (hash !== expectedHash) {
      return res.status(403).send('Invalid hash');
    }

    if (status !== '1') return res.send('OK'); // not completed

    // Find user and credit them
    const user = await User.findById(user_id);
    if (!user) return res.status(404).send('User not found');

    // Check duplicate transaction
    const existing = await Transaction.findOne({ txHash: trans_id });
    if (existing) return res.send('OK'); // already credited

    const earning = parseFloat(amount_usd) * 0.3; // give user 30%

    user.balance += earning;
    user.totalEarned += earning;
    user.tasksCompletedToday += 1;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'task',
      amount: earning,
      status: 'completed',
      txHash: trans_id,
      note: `CPX Survey completed`
    });

    res.send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
});

module.exports = router;