const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// User sends message to admin
router.post('/send', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const msg = await Message.create({ userId: req.user._id, sender: 'user', content });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's chat history
router.get('/my-messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all conversations
router.get('/admin/conversations', adminAuth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    const userIds = [...new Set(messages.map(m => m.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select('username email');
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const conversations = userIds.map(uid => {
      const userMsgs = messages.filter(m => m.userId.toString() === uid);
      const lastMsg = userMsgs[0];
      const unread = userMsgs.filter(m => m.sender === 'user' && !m.read).length;
      return { userId: uid, user: userMap[uid], lastMessage: lastMsg, unreadCount: unread };
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get messages for specific user
router.get('/admin/messages/:userId', adminAuth, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    await Message.updateMany({ userId: req.params.userId, sender: 'user', read: false }, { read: true });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: reply to user
router.post('/admin/reply', adminAuth, async (req, res) => {
  try {
    const { userId, content } = req.body;
    const msg = await Message.create({ userId, sender: 'admin', content });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
