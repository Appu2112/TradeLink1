const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Import authentication middleware
const authMiddleware = require('../middleware/authmiddleware');

// Setup Postgres connection pool using your .env connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Secret key for signing JWTs
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_changelater';

// ==========================================
// 1. REGISTER USER (Sign Up)
// ==========================================
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide username, email, and password' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ==========================================
// 2. LOGIN USER
// ==========================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ==========================================
// 3. GET USER PROFILE
// ==========================================
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userQuery = await pool.query(
      'SELECT id, username, email, phone_number, address, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userQuery.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// ==========================================
// 4. UPDATE USER PROFILE
// ==========================================
router.put('/profile', authMiddleware, async (req, res) => {
  const { phone_number, address } = req.body;

  try {
    const updatedUser = await pool.query(
      `UPDATE users 
       SET phone_number = $1, address = $2 
       WHERE id = $3 
       RETURNING id, username, email, phone_number, address, created_at`,
      [phone_number, address, req.user.id]
    );

    res.json({
      message: 'Profile updated successfully!',
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

module.exports = router;