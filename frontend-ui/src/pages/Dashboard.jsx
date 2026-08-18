import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, PlusCircle, LogOut, DollarSign, Activity, ListOrdered, FileText, Loader2, Wallet, Download, Trash2, Edit3, X, Check } from 'lucide-react';

const CRYPTO_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  XRP: 'ripple',
  BNB: 'binancecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  LINK: 'chainlink'
};

function Dashboard({ onLogout }) {
  const [stats, setStats] = useState({ totalTrades: 0, totalPL: 0, portfolio: [] });
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Edit Modal State
  const [editingTrade, setEditingTrade] = useState(null);
  const [editForm, setEditForm] = useState({ symbol: '', action: 'BUY', quantity: '', price: '', notes: '' });

  const API_URL = 'https://tradelink1-43ev.onrender.com';

  const fetchLivePrices = async (symbols) => {
    try {
      const ids = symbols
        .map((s) => CRYPTO_MAP[s.toUpperCase()])
        .filter(Boolean)
        .join(',');

      if (!ids) return {};

      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );

      const priceMap = {};
      symbols.forEach((sym) => {
        const geckoId = CRYPTO_MAP[sym.toUpperCase()];
        if (geckoId && res.data[geckoId]) {
          priceMap[sym.toUpperCase()] = res.data[geckoId].usd;
        }
      });

      return priceMap;
    } catch (err) {
      console.error('Failed to fetch live prices:', err);
      return {};
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      setLoading(true);
      const [statsRes, tradesRes] = await Promise.all([
        axios.get(`${API_URL}/api/trades/analytics`, config),
        axios.get(`${API_URL}/api/trades`, config)
      ]);

      const rawPortfolio = statsRes.data.portfolio || [];
      const symbols = rawPortfolio.map((item) => item.symbol);
      const livePrices = await fetchLivePrices(symbols);

      let calculatedTotalPL = 0;
      const updatedPortfolio = rawPortfolio.map((item) => {
        const sym = item.symbol.toUpperCase();
        const livePrice = livePrices[sym] || parseFloat(item.currentMarketPrice || item.avgBuyPrice || 0);
        const holdings = parseFloat(item.currentHoldings || 0);
        const avgBuy = parseFloat(item.avgBuyPrice || 0);

        const totalValue = holdings * livePrice;
        const unrealizedPL = (livePrice - avgBuy) * holdings;
        calculatedTotalPL += unrealizedPL;

        return {
          ...item,
          currentMarketPrice: livePrice,
          totalValue,
          unrealizedPL
        };
      });

      setStats({
        ...statsRes.data,
        totalPL: calculatedTotalPL,
        portfolio: updatedPortfolio
      });
      setTrades(tradesRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogTrade = async (e) => {
    e.preventDefault();
    if (parseFloat(quantity) <= 0 || parseFloat(price) <= 0) {
      alert("Quantity and price must be greater than 0.");
      return;
    }

    setFormLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(`${API_URL}/api/trades`, {
        symbol: symbol.toUpperCase().trim(),
        action,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        notes: notes.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSymbol('');
      setQuantity('');
      setPrice('');
      setNotes('');
      fetchDashboardData();
    } catch (err) {
      console.error('Error logging trade:', err);
      alert('Failed to log trade.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to delete this trade execution?")) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/trades/${tradeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting trade:', err);
      alert('Failed to delete trade.');
    }
  };

  const handleOpenEdit = (trade) => {
    setEditingTrade(trade);
    setEditForm({
      symbol: trade.symbol,
      action: trade.action,
      quantity: trade.quantity,
      price: trade.price,
      notes: trade.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.put(`${API_URL}/api/trades/${editingTrade.id}`, {
        ...editForm,
        symbol: editForm.symbol.toUpperCase().trim(),
        quantity: parseFloat(editForm.quantity),
        price: parseFloat(editForm.price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditingTrade(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating trade:', err);
      alert('Failed to update trade entry.');
    }
  };

  const handleExportCSV = () => {
    if (!trades || trades.length === 0) {
      alert("No trades available to export.");
      return;
    }

    const headers = ["ID", "Symbol", "Action", "Quantity", "Price", "Notes", "Date"];
    const rows = trades.map((t) => [
      t.id || "",
      t.symbol || "",
      t.action || "",
      t.quantity || 0,
      t.price || 0,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
      t.created_at ? new Date(t.created_at).toISOString() : ""
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tradelink_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center border-b border-slate-900 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TradeLink <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-850 ml-2">Terminal v1.2</span></h1>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-sm px-4 py-2 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Floating P&L</p>
                <h3 className={`text-2xl font-black mt-1 ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL ? stats.totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stats.totalPL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Operations</p>
                <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.totalTrades || 0}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Current Portfolio Breakdown */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Current Portfolio Breakdown</h3>
            </div>
            
            {!stats.portfolio || stats.portfolio.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No active holdings. Log a BUY trade to populate assets.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.portfolio.map((asset) => (
                  <div key={asset.symbol} className="bg-slate-950 border border-slate-850/80 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-base text-slate-200 tracking-tight">{asset.symbol}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${parseFloat(asset.unrealizedPL || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {parseFloat(asset.unrealizedPL || 0) >= 0 ? '+' : ''}${parseFloat(asset.unrealizedPL || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-400 border-t border-slate-900/50 pt-2">
                      <div>Holdings: <span className="font-mono text-slate-200 block mt-0.5">{asset.currentHoldings}</span></div>
                      <div>Total Value: <span className="font-mono text-slate-200 block mt-0.5">${parseFloat(asset.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                      <div>Avg Buy: <span className="font-mono text-slate-50 block mt-0.5">${parseFloat(asset.avgBuyPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                      <div>Live Price: <span className="font-mono text-slate-400 block mt-0.5">${parseFloat(asset.currentMarketPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction Ledger Table */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Transaction Ledger</h3>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-850 text-xs font-semibold text-slate-500 uppercase">
                    <th className="p-4">Asset</th>
                    <th className="p-4">Action</th>
                    <th className="p-4 text-right">Size</th>
                    <th className="p-4 text-right">Execution Price</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-sm">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-500">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    trades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-950/30 transition">
                        <td className="p-4 font-bold text-slate-200">{trade.symbol}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${trade.action === 'BUY' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-rose-500/5 text-rose-400 border-rose-500/10'}`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-slate-300">{trade.quantity}</td>
                        <td className="p-4 text-right font-mono text-slate-300">${parseFloat(trade.price).toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(trade)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                              title="Edit trade"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrade(trade.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              title="Delete trade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Form */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl h-fit space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Log New Position</h3>
          </div>
          
          <form onSubmit={handleLogTrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Ticker Symbol</label>
                <input 
                  type="text" required placeholder="BTC, ETH" value={symbol} onChange={e => setSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Action</label>
                <select 
                  value={action} onChange={e => setAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Quantity / Size</label>
                <input 
                  type="number" step="any" required placeholder="0.5" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Price ($)</label>
                <input 
                  type="number" step="any" required placeholder="65000" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> Memo / Notes</label>
              <textarea 
                rows="2" placeholder="Why did you take this trade?" value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit" disabled={formLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-bold text-sm py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute Log'}
            </button>
          </form>
        </div>
      </main>

      {/* Edit Modal Overlay */}
      {editingTrade && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-200">Modify Trade Execution</h3>
              <button onClick={() => setEditingTrade(null)} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Ticker</label>
                  <input 
                    type="text" required value={editForm.symbol} onChange={e => setEditForm({ ...editForm, symbol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Action</label>
                  <select 
                    value={editForm.action} onChange={e => setEditForm({ ...editForm, action: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 mt-1"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Quantity</label>
                  <input 
                    type="number" step="any" required value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Price ($)</label>
                  <input 
                    type="number" step="any" required value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 mt-1 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase">Notes</label>
                <textarea 
                  rows="2" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 mt-1 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" onClick={() => setEditingTrade(null)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-sm py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;