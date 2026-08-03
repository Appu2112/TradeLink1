const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authMiddleware = require('../middleware/authmiddleware'); // Import our security guard!

// Setup Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==========================================
// 1. LOG A NEW TRADE (Protected Route)
// ==========================================
router.post('/', auth, async (req, res) => {
  const { symbol, action, quantity, price, notes } = req.body;

  // Simple validation
  if (!symbol || !action || !quantity || !price) {
    return res.status(400).json({ error: 'Please provide symbol, action, quantity, and price' });
  }

  try {
    // req.user.id comes directly from our auth middleware verification!
    const newTrade = await pool.query(
      `INSERT INTO trades (user_id, symbol, action, quantity, price, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.id, symbol.toUpperCase(), action.toUpperCase(), quantity, price, notes]
    );

    res.status(201).json({
      message: 'Trade logged successfully!',
      trade: newTrade.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while logging trade' });
  }
});

// ==========================================
// 2. GET ALL TRADES FOR LOGGED-IN USER (Protected Route)
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    // We only fetch trades where user_id matches the logged-in user!
    const userTrades = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(userTrades.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching trades' });
  }
});
// ==========================================
// 3. UPGRADED PERFORMANCE & HOLDINGS ENGINE
// ==========================================
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all trades for this user to calculate holdings
    const tradesQuery = await pool.query(
      'SELECT symbol, action, quantity, price FROM trades WHERE user_id = $1',
      [userId]
    );
    
    const allTrades = tradesQuery.rows;

    // 2. MOCK LIVE MARKET PRICES (Simulating a live market data feed)
    const livePrices = {
      'BTC': 74500,  // Assume Bitcoin went up!
      'ETH': 3650,   // Assume Ethereum moved up slightly
      'NVDA': 142    // Assume Nvidia gained value
    };

    // 3. Process raw trades into net holdings
    const holdingsMap = {};
    let totalRealizedPL = 0;
    let totalCapitalInvested = 0;

    allTrades.forEach(trade => {
      const { symbol, action, quantity, price } = trade;
      const qty = parseFloat(quantity);
      const prc = parseFloat(price);

      if (!holdingsMap[symbol]) {
        holdingsMap[symbol] = { quantity: 0, totalCost: 0 };
      }

      if (action === 'BUY') {
        holdingsMap[symbol].quantity += qty;
        holdingsMap[symbol].totalCost += (qty * prc);
        totalCapitalInvested += (qty * prc);
      } else if (action === 'SELL') {
        // Realized P&L calculation based on selling price vs original cost estimation
        const averageCost = holdingsMap[symbol].quantity > 0 
          ? (holdingsMap[symbol].totalCost / holdingsMap[symbol].quantity) 
          : prc;
        
        holdingsMap[symbol].quantity -= qty;
        holdingsMap[symbol].totalCost -= (qty * averageCost);
        
        totalRealizedPL += (qty * prc) - (qty * averageCost);
      }
    });

    // 4. Calculate Unrealized P&L against our "live prices"
    let totalUnrealizedPL = 0;
    const portfolioBreakdown = [];

    Object.keys(holdingsMap).forEach(symbol => {
      const holding = holdingsMap[symbol];
      if (holding.quantity > 0) {
        const currentPrice = livePrices[symbol.toUpperCase()] || (holding.totalCost / holding.quantity);
        const currentTotalValue = holding.quantity * currentPrice;
        const assetCostBasis = holding.totalCost;
        const assetUnrealizedPL = currentTotalValue - assetCostBasis;

        totalUnrealizedPL += assetUnrealizedPL;

        portfolioBreakdown.push({
          symbol,
          currentHoldings: holding.quantity,
          avgBuyPrice: (assetCostBasis / holding.quantity).toFixed(2),
          currentMarketPrice: currentPrice,
          totalValue: currentTotalValue.toFixed(2),
          unrealizedPL: assetUnrealizedPL.toFixed(2)
        });
      }
    });

    // Send the detailed, intelligent report back to React
    res.json({
      totalTrades: allTrades.length,
      totalPL: parseFloat((totalRealizedPL + totalUnrealizedPL).toFixed(2)),
      portfolio: portfolioBreakdown,
      message: "Advanced live analytics computed!"
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while calculating advanced analytics' });
  }
});
module.exports = router;