const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const myReferralCode = uuidv4().slice(0, 8).toUpperCase();

    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode });
    }

    const user = new User({
      username,
      email,
      password: hashed,
      referralCode: myReferralCode,
      referredBy: referredByUser ? referredByUser._id : null
    });

    await user.save();

    if (referredByUser) {
      referredByUser.referralCount += 1;
      await referredByUser.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username, email, level: user.level, balance: user.balance, referralCode: myReferralCode } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account has been blocked. Contact admin.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, level: user.level, balance: user.balance, referralCode: user.referralCode, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
