const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ targetUserId: null }, { targetUserId: req.user._id }]
    }).sort({ createdAt: -1 }).limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as read
router.post('/read/:id', auth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif.read.includes(req.user._id)) {
      notif.read.push(req.user._id);
      await notif.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: send notification to all
router.post('/admin/broadcast', adminAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const notif = await Notification.create({ title, content, targetUserId: null });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: send notification to specific user
router.post('/admin/send', adminAuth, async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const notif = await Notification.create({ title, content, targetUserId: userId });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
