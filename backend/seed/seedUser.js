require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seedUser() {
  try {
    await connectDB();

    const username = 'admin';
    const password = 'secret321';
    const passwordHash = await bcrypt.hash(password, 10);

    await User.deleteMany({ username });

    await User.create({ username, passwordHash });

    console.log('Seeded user: admin / secret321');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedUser();