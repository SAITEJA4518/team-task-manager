import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// --- SIGNUP GATE ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'This email is already registered!' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Member'
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully! 🎉' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error: error.message });
  }
});

// --- LOGIN GATE (NEW!) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Look for the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 2. Check if the password matches the scrambled database password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 3. Create a secret key card (Token) that lasts for 1 day
    // We will use a fallback secret string since we are developing locally
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'SUPER_SECRET_KEY_CARD',
      { expiresIn: '1d' }
    );

    // 4. Send back the token and user details to the frontend
    res.json({
      message: 'Login successful! 👋',
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

export default router;