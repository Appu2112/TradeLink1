require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Basic Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Online', dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Database Connection Error', error: err.message });
  }
});
  
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});