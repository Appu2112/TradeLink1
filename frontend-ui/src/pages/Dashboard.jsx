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
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import Profile from './Profile';
import PortfolioCharts from '../components/PortfolioCharts';
import LedgerToolbar from '../components/LedgerToolbar';
import TagPerformance from './TagPerformance';

function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('terminal');

  // Form States
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [tag, setTag] = useState('Breakout');
  const [notes, setNotes] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState(null);

  // Data & Filter States
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Pagination & Sorting States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const API_URL = 'https://tradelink1-43ev.onrender.com';

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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

  const handleSaveTrade = async (e) => {
    e.preventDefault();
    if (!ticker || !shares || !buyPrice) return alert('Please complete required fields');

    setSubmitting(true);
    const token = localStorage.getItem('token');

    const payload = {
      symbol: ticker.toUpperCase(),
      action: sellPrice ? 'SELL' : 'BUY',
      quantity: parseFloat(shares),
      price: sellPrice ? parseFloat(sellPrice) : parseFloat(buyPrice),
      buy_price: parseFloat(buyPrice),
      sell_price: sellPrice ? parseFloat(sellPrice) : null,
      tag: tag,
      notes: notes
    };

    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/api/trades/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedItem = res.data.trade || res.data;
        setTrades(trades.map(t => t.id === editingId ? updatedItem : t));
      } else {
        const res = await axios.post(`${API_URL}/api/trades`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const newItem = res.data.trade || res.data;
        setTrades([newItem, ...trades]);
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving trade:', err);
      alert('Failed to save trade.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (trade) => {
    setEditingId(trade.id);
    setTicker(trade.ticker || trade.symbol || '');
    setShares(trade.shares || trade.quantity || '');
    setBuyPrice(trade.buy_price || trade.price || '');
    setSellPrice(trade.sell_price || (trade.action === 'SELL' ? trade.price : ''));
    setTag(trade.tag || 'Breakout');
    setNotes(trade.notes || '');
    setActiveTab('terminal');
  };

  const resetForm = () => {
    setEditingId(null);
    setTicker('');
    setShares('');
    setBuyPrice('');
    setSellPrice('');
    setTag('Breakout');
    setNotes('');
  };

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

  const getTradePnL = (t) => {
    const sell = t.sell_price || (t.action === 'SELL' ? t.price : null);
    const buy = t.buy_price || t.price;
    const qty = t.shares || t.quantity || 0;
    return sell ? (parseFloat(sell) - parseFloat(buy)) * parseFloat(qty) : null;
  };

  const totalTrades = trades.length;
  const totalPL = trades.reduce((acc, t) => {
    const pnl = getTradePnL(t);
    return pnl !== null ? acc + pnl : acc;
  }, 0);

  const closedTrades = trades.filter(t => t.sell_price || t.action === 'SELL').length;
  const winningTrades = trades.filter(t => {
    const pnl = getTradePnL(t);
    return pnl !== null && pnl > 0;
  }).length;
  
  const winRate = closedTrades > 0 ? ((winningTrades / closedTrades) * 100).toFixed(0) : 0;

  const filteredTrades = trades.filter(t => {
    const sym = (t.ticker || t.symbol || '').toUpperCase();
    const tradeNotes = (t.notes || '').toLowerCase();
    const tradeTag = (t.tag || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();

    const matchesSearch = sym.includes(query.toUpperCase()) || tradeNotes.includes(query) || tradeTag.includes(query);
    const isClosed = Boolean(t.sell_price || t.action === 'SELL');
    const matchesFilter = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'OPEN' ? !isClosed :
      filterStatus === 'CLOSED' ? isClosed : true;

    return matchesSearch && matchesFilter;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    if (sortField === 'symbol') {
      const symA = (a.ticker || a.symbol || '').toUpperCase();
      const symB = (b.ticker || b.symbol || '').toUpperCase();
      return sortDirection === 'asc' ? symA.localeCompare(symB) : symB.localeCompare(symA);
    }
    if (sortField === 'pnl') {
      const pnlA = getTradePnL(a) ?? -Infinity;
      const pnlB = getTradePnL(b) ?? -Infinity;
      return sortDirection === 'asc' ? pnlA - pnlB : pnlB - pnlA;
    }
    return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
  });

  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrades = sortedTrades.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-5 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">TradeLink</h1>
          </div>

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

      {activeTab === 'profile' ? (
        <Profile />
      ) : (
        <main className="max-w-7xl mx-auto space-y-8">
          {/* Stats Header */}
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

          <PortfolioCharts trades={trades} />

          {/* Setup Tag Breakdown */}
          <TagPerformance trades={trades} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 h-fit">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-200">
                  {editingId ? 'Edit Trade Execution' : 'Log New Execution'}
                </h2>
                {editingId && (
                  <button 
                    onClick={resetForm} 
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
                    placeholder="Leave empty if OPEN"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Setup Tag</label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Breakout">Breakout</option>
                    <option value="Dip Buy">Dip Buy</option>
                    <option value="Earnings Play">Earnings Play</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Trend Following">Trend Following</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Trade Notes / Rationale</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. 200 EMA bounce on 15m chart..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
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

            {/* Ledger Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <LedgerToolbar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  trades={sortedTrades}
                />

                {loading ? (
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  </div>
                ) : currentTrades.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    {trades.length === 0 ? "No trades recorded yet. Log your first position!" : "No matching trades found."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('symbol')}>
                            <div className="flex items-center gap-1">
                              Ticker / Tag <ArrowUpDown className="w-3 h-3 text-slate-500" />
                            </div>
                          </th>
                          <th className="py-3 px-4">Shares</th>
                          <th className="py-3 px-4">Buy ($)</th>
                          <th className="py-3 px-4">Sell ($)</th>
                          <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('pnl')}>
                            <div className="flex items-center gap-1">
                              P&L ($) <ArrowUpDown className="w-3 h-3 text-slate-500" />
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {currentTrades.map((t) => {
                          const sym = t.ticker || t.symbol;
                          const qty = t.shares || t.quantity;
                          const buy = t.buy_price || t.price;
                          const sell = t.sell_price || (t.action === 'SELL' ? t.price : null);
                          const pl = getTradePnL(t);

                          return (
                            <tr key={t.id} className="hover:bg-slate-850/50 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-100 uppercase">{sym}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {t.tag && (
                                    <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 font-medium">
                                      {t.tag}
                                    </span>
                                  )}
                                  {t.notes && (
                                    <span className="text-[11px] text-slate-500 truncate max-w-[120px]" title={t.notes}>
                                      {t.notes}
                                    </span>
                                  )}
                                </div>
                              </td>
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

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <p>
                    Showing <span className="text-slate-200 font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="text-slate-200 font-semibold">{Math.min(indexOfLastItem, sortedTrades.length)}</span> of{' '}
                    <span className="text-slate-200 font-semibold">{sortedTrades.length}</span> entries
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-slate-200">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
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