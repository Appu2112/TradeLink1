import React from 'react';
import { Search, Download } from 'lucide-react';

export default function LedgerToolbar({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  trades 
}) {
  // CSV Download Handler
  const handleExportCSV = () => {
    if (trades.length === 0) return alert('No trades available to export.');

    const headers = ['Ticker', 'Shares', 'Buy Price ($)', 'Sell Price ($)', 'Action', 'Status', 'Tag', 'Notes'];
    
    const rows = trades.map(t => [
      (t.ticker || t.symbol || '').toUpperCase(),
      t.shares || t.quantity || 0,
      t.buy_price || t.price || 0,
      t.sell_price || '',
      t.action || (t.sell_price ? 'SELL' : 'BUY'),
      t.sell_price ? 'CLOSED' : 'OPEN',
      `"${t.tag || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradelink_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-slate-800 pb-4 mb-4">
      <h2 className="text-base font-bold text-slate-200 w-full sm:w-auto">Trade Ledger</h2>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-56">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search ticker, tag, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open Positions</option>
            <option value="CLOSED">Closed Positions</option>
          </select>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
          title="Export Ledger to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>
    </div>
  );
}