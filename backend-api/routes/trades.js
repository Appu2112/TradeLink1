const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authMiddleware = require('../middleware/authmiddleware');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==========================================
// 1. LOG A NEW TRADE
// ==========================================
router.post('/', authMiddleware, async (req, res) => {
  const { symbol, ticker, quantity, shares, price, buy_price, sell_price, notes } = req.body;

  // Support both key naming conventions
  const tradeSymbol = (symbol || ticker || '').toUpperCase();
  const tradeQty = quantity || shares;
  const tradePrice = price || buy_price;
  const tradeAction = sell_price ? 'SELL' : 'BUY';

  // Validation
  if (!tradeSymbol || !tradeQty || !tradePrice) {
    return res.status(400).json({ error: 'Please provide symbol/ticker, quantity/shares, and price' });
  }

  try {
    const newTrade = await pool.query(
      `INSERT INTO trades (user_id, symbol, action, quantity, price, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.id, tradeSymbol, tradeAction, tradeQty, tradePrice, notes || null]
    );

    // Standardize object fields sent back to frontend
    const row = newTrade.rows[0];
    res.status(201).json({
      ...row,
      ticker: row.symbol,
      shares: row.quantity,
      buy_price: row.price,
      sell_price: sell_price || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while logging trade' });
  }
});

// ==========================================
// 2. GET ALL TRADES FOR LOGGED-IN USER
// ==========================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userTrades = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    // Map database output so frontend components can read either property name safely
    const formattedTrades = userTrades.rows.map(row => ({
      ...row,
      ticker: row.symbol,
      shares: row.quantity,
      buy_price: row.price,
      sell_price: row.action === 'SELL' ? row.price : null
    }));

    res.json(formattedTrades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching trades' });
  }
});

// ==========================================
// 3. EDIT / UPDATE A TRADE
// ==========================================
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { symbol, ticker, quantity, shares, price, buy_price, sell_price, notes } = req.body;

  const tradeSymbol = (symbol || ticker || '').toUpperCase();
  const tradeQty = quantity || shares;
  const tradePrice = price || buy_price;
  const tradeAction = sell_price ? 'SELL' : 'BUY';

  if (!tradeSymbol || !tradeQty || !tradePrice) {
    return res.status(400).json({ error: 'Please provide symbol/ticker, quantity/shares, and price' });
  }

  try {
    const updatedTrade = await pool.query(
      `UPDATE trades 
       SET symbol = $1, action = $2, quantity = $3, price = $4, notes = $5 
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [tradeSymbol, tradeAction, tradeQty, tradePrice, notes || null, id, req.user.id]
    );

    if (updatedTrade.rowCount === 0) {
      return res.status(404).json({ error: 'Trade not found or unauthorized' });
    }

    const row = updatedTrade.rows[0];
    res.json({
      ...row,
      ticker: row.symbol,
      shares: row.quantity,
      buy_price: row.price,
      sell_price: sell_price || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating trade' });
  }
});

// ==========================================
// 4. DELETE A TRADE
// ==========================================
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTrade = await pool.query(
      'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (deletedTrade.rowCount === 0) {
      return res.status(404).json({ error: 'Trade not found or unauthorized' });
    }

    res.json({ message: 'Trade deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting trade' });
  }
});

// ==========================================
// 5. PERFORMANCE ANALYTICS
// ==========================================
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const tradesQuery = await pool.query(
      'SELECT symbol, action, quantity, price FROM trades WHERE user_id = $1',
      [req.user.id]
    );
    
    const allTrades = tradesQuery.rows;
    const livePrices = { 'BTC': 74500, 'ETH': 3650, 'NVDA': 142 };

    const holdingsMap = {};
    let totalRealizedPL = 0;

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
      } else if (action === 'SELL') {
        const averageCost = holdingsMap[symbol].quantity > 0 
          ? (holdingsMap[symbol].totalCost / holdingsMap[symbol].quantity) 
          : prc;
        
        holdingsMap[symbol].quantity -= qty;
        holdingsMap[symbol].totalCost -= (qty * averageCost);
        totalRealizedPL += (qty * prc) - (qty * averageCost);
      }
    });

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

    res.json({
      totalTrades: allTrades.length,
      totalPL: parseFloat((totalRealizedPL + totalUnrealizedPL).toFixed(2)),
      portfolio: portfolioBreakdown
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while calculating analytics' });
  }
});

module.exports = router;