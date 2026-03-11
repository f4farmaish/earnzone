const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.get('/', (req, res) => res.send('EarnZone API is running'));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/postback', require('./routes/postback'));

// Fix for Vercel - reuse connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected');
  } catch (err) {
    console.log('MongoDB Error:', err.message);
    isConnected = false;
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});
// Connect DB before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

module.exports = app;