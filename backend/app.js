// Why are we requiring these three? What are they for?
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const computerRoutes = require('./routes/computerRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Computer Inventory API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/computers', computerRoutes);

module.exports = app;
