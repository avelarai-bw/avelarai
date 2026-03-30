const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId, username) =>
  jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Username or email already taken' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed });
    const token = signToken(user._id.toString(), user.username);

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, tier: user.tier }
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id.toString(), user.username);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, tier: user.tier }
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };