const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.get('/', (req, res) => res.send('EarnZone API is running'));

app.use(cors());
app.use(express.json());

// Connect to MongoDB once
mongoose.connect(process.env.MONGODB_URI, {
  bufferCommands: false,
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 5000,
  family: 4  // Force IPv4 - THIS IS THE KEY FIX
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err.message));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/postback', require('./routes/postback'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;