// Why do we require each one of the followin? What are they for?
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = createToken(user);

    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // How does this condition work?
    if (!newPassword || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must include at least one number' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  login,
  changePassword
};