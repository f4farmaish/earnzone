const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.route('/').get((req, res) => {
  res.send('EarnZone API is running');
});
app.use(cors());
app.use(express.json());
require('dotenv').config();
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://farmaishalifaf:Farmaish123@cluster0.aru51az.mongodb.net/earnzone?appName=Cluster0";

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
