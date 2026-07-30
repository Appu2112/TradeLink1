const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🔄 Connecting to PostgreSQL database...');

  try {
    // 1. Ensure Users Table has flexible defaults
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255),
        password VARCHAR(255),
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table ready.');

    // 2. Ensure Trades Table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(10) NOT NULL,
        action VARCHAR(4) CHECK (action IN ('BUY', 'SELL')) NOT NULL,
        quantity NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Trades table ready.');

    // 3. Inspect existing column names on 'users' table
    const columnsRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    const existingColumns = columnsRes.rows.map(col => col.column_name);
    
    // Check password column naming variation
    const passwordCol = existingColumns.includes('password_hash') ? 'password_hash' : 'password';
    const hasUsername = existingColumns.includes('username');

    // 4. Seed Demo User
    const demoEmail = 'demo@tradelink.io';
    let userResult = await pool.query('SELECT id FROM users WHERE email = $1', [demoEmail]);
    let userId;

    if (userResult.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('DemoPassword123!', 10);
      
      let insertQuery;
      let queryParams;

      if (hasUsername) {
        insertQuery = `INSERT INTO users (email, username, ${passwordCol}) VALUES ($1, $2, $3) RETURNING id`;
        queryParams = [demoEmail, 'demouser', hashedPassword];
      } else {
        insertQuery = `INSERT INTO users (email, ${passwordCol}) VALUES ($1, $2) RETURNING id`;
        queryParams = [demoEmail, hashedPassword];
      }

      const newUser = await pool.query(insertQuery, queryParams);
      userId = newUser.rows[0].id;
      console.log(`👤 Seeded demo user: ${demoEmail}`);
    } else {
      userId = userResult.rows[0].id;
      console.log(`ℹ️ Demo user already exists (ID: ${userId}).`);
    }

    // 5. Seed initial portfolio trades
    const tradeCheck = await pool.query('SELECT id FROM trades WHERE user_id = $1', [userId]);
    if (tradeCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO trades (user_id, symbol, action, quantity, price, notes)
        VALUES 
          ($1, 'BTC', 'BUY', 0.5, 62000, 'Initial spot entry on breakout'),
          ($1, 'NVDA', 'BUY', 10, 120, 'Long-term AI ecosystem exposure'),
          ($1, 'ETH', 'BUY', 2.0, 3100, 'Staking allocation')
      `, [userId]);
      console.log('📈 Seeded demo portfolio transactions.');
    } else {
      console.log('ℹ️ Demo trades already populated.');
    }

    console.log('🎉 Database setup complete!');
  } catch (err) {
    console.error('❌ Error setting up database:', err.message);
  } finally {
    await pool.end();
  }
}   setupDatabase();