import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Activity, 
  Loader2,
  User,
  LayoutDashboard
} from 'lucide-react';
import Profile from './Profile';

function Dashboard({ onLogout }) {
  // Navigation State ('terminal' or 'profile')
  const [activeTab, setActiveTab] = useState('terminal');

  // Trade Form States
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState(null);

  // Data States
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = 'https://tradelink1-43ev.onrender.com';

  // Fetch Trades on Load
  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrades(res.data);
    } catch (err) {
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add or Update Trade
  const handleSaveTrade = async (e) => {
    e.preventDefault();
    if (!ticker || !shares || !buyPrice) return alert('Please complete required fields');

    setSubmitting(true);
    const token = localStorage.getItem('token');

    // Formatted payload matching trades.js requirements (symbol, action, quantity, price)
    const payload = {
      symbol: ticker.toUpperCase(),
      action: sellPrice ? 'SELL' : 'BUY',
      quantity: parseFloat(shares),
      price: sellPrice ? parseFloat(sellPrice) : parseFloat(buyPrice),
      buy_price: parseFloat(buyPrice),
      sell_price: sellPrice ? parseFloat(sellPrice) : null
    };

    try {
      if (editingId) {
        // PUT Request to Update Trade
        const res = await axios.put(`${API_URL}/api/trades/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedItem = res.data.trade || res.data;
        setTrades(trades.map(t => t.id === editingId ? updatedItem : t));
        setEditingId(null);
      } else {
        // POST Request to Add Trade
        const res = await axios.post(`${API_URL}/api/trades`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const newItem = res.data.trade || res.data;
        setTrades([newItem, ...trades]);
      }
      
      // Reset Form
      setTicker('');
      setShares('');
      setBuyPrice('');
      setSellPrice('');
    } catch (err) {
      console.error('Error saving trade:', err);
      alert('Failed to save trade.');
    } finally {
      setSubmitting(false);
    }
  };

  // Populate Form for Editing
  const handleEdit = (trade) => {
    setEditingId(trade.id);
    setTicker(trade.ticker || trade.symbol || '');
    setShares(trade.shares || trade.quantity || '');
    setBuyPrice(trade.buy_price || trade.price || '');
    setSellPrice(trade.sell_price || (trade.action === 'SELL' ? trade.price : ''));
    setActiveTab('terminal');
  };

  // Cancel Edit Mode
  const cancelEdit = () => {
    setEditingId(null);
    setTicker('');
    setShares('');
    setBuyPrice('');
    setSellPrice('');
  };

  // Delete Trade
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trade?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/trades/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrades(trades.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting trade:', err);
      alert('Failed to delete trade.');
    }
  };

  // Analytics Calculations
  const totalTrades = trades.length;
  const totalPL = trades.reduce((acc, t) => {
    const sell = t.sell_price || (t.action === 'SELL' ? t.price : null);
    const buy = t.buy_price || (t.action === 'BUY' ? t.price : t.price);
    const qty = t.shares || t.quantity || 0;
    
    if (sell) {
      return acc + (parseFloat(sell) - parseFloat(buy)) * parseFloat(qty);
    }
    return acc;
  }, 0);

  const closedTrades = trades.filter(t => t.sell_price || t.action === 'SELL').length;
  const winningTrades = trades.filter(t => {
    const sell = t.sell_price || (t.action === 'SELL' ? t.price : null);
    const buy = t.buy_price || t.price;
    return sell && parseFloat(sell) > parseFloat(buy);
  }).length;
  
  const winRate = closedTrades > 0 ? ((winningTrades / closedTrades) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      {/* Header with Navigation Tabs */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-5 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">TradeLink</h1>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'terminal' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </button>
          </nav>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-sm px-4 py-2 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </header>

      {/* Switch between Terminal and Profile */}
      {activeTab === 'profile' ? (
        <Profile />
      ) : (
        <main className="max-w-7xl mx-auto space-y-8">
          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Realized P&L</p>
                <p className={`text-2xl font-bold mt-1 ${totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${totalPL.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{winRate}%</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-slate-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Logged Trades</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{totalTrades}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-slate-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Form Column */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 h-fit">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-200">
                  {editingId ? 'Edit Trade Execution' : 'Log New Execution'}
                </h2>
                {editingId && (
                  <button 
                    onClick={cancelEdit} 
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveTrade} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Ticker / Symbol</label>
                  <input
                    type="text"
                    placeholder="AAPL, TSLA, BTC"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Shares / Size</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="100"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Buy Price ($)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="150.00"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Sell Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Leave empty if position is OPEN"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-bold text-sm py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    'Update Execution'
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Trade Execution
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Table Column */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
              <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">Trade Ledger</h2>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              ) : trades.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No trades recorded yet. Log your first position!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Ticker</th>
                        <th className="py-3 px-4">Shares</th>
                        <th className="py-3 px-4">Buy ($)</th>
                        <th className="py-3 px-4">Sell ($)</th>
                        <th className="py-3 px-4">P&L ($)</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {trades.map((t) => {
                        const sym = t.ticker || t.symbol;
                        const qty = t.shares || t.quantity;
                        const buy = t.buy_price || t.price;
                        const sell = t.sell_price || (t.action === 'SELL' ? t.price : null);
                        const pl = sell ? (parseFloat(sell) - parseFloat(buy)) * parseFloat(qty) : null;

                        return (
                          <tr key={t.id} className="hover:bg-slate-850/50 transition">
                            <td className="py-3 px-4 font-bold text-slate-100 uppercase">{sym}</td>
                            <td className="py-3 px-4">{qty}</td>
                            <td className="py-3 px-4">${parseFloat(buy).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              {sell ? `$${parseFloat(sell).toFixed(2)}` : (
                                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">OPEN</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              {pl !== null ? (
                                <span className={pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {pl >= 0 ? `+$${pl.toFixed(2)}` : `-$${Math.abs(pl).toFixed(2)}`}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleEdit(t)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition cursor-pointer"
                                title="Edit Trade"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                                title="Delete Trade"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Dashboard;