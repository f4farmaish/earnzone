const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

router.get('/cpx', async (req, res) => {
  try {
    const { status, trans_id, user_id, amount_usd, hash } = req.query;

    // Verify hash
    const CPX_SECRET = process.env.CPX_SECRET || 'FarmaishFarmaish';
    const expectedHash = crypto.createHash('md5').update(trans_id + '-' + CPX_SECRET).digest('hex');
    if (hash !== expectedHash) return res.status(403).send('Invalid hash');

    // Status 2 = reversed/fraud - deduct earning
    if (status === '2') {
      const tx = await Transaction.findOne({ txHash: trans_id });
      if (tx) {
        const user = await User.findById(user_id);
        if (user) {
          user.balance -= tx.amount;
          user.totalEarned -= tx.amount;
          await user.save();
          tx.status = 'rejected';
          await tx.save();
        }
      }
      return res.send('OK');
    }

    if (status !== '1') return res.send('OK');

    // Check duplicate
    const existing = await Transaction.findOne({ txHash: trans_id });
    if (existing) return res.send('OK');

    const user = await User.findById(user_id);
    if (!user) return res.status(404).send('User not found');

    const earning = parseFloat(amount_usd) * 0.3;

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