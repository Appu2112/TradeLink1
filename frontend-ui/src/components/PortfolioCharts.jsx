import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function PortfolioCharts({ trades }) {
  // 1. Process trades for Cumulative P&L Line Chart
  const sortedTrades = [...trades]
    .filter(t => t.sell_price || t.action === 'SELL')
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

  let cumulativePL = 0;
  const pnlData = sortedTrades.map((t, index) => {
    const buy = parseFloat(t.buy_price || t.price || 0);
    const sell = parseFloat(t.sell_price || t.price || 0);
    const qty = parseFloat(t.shares || t.quantity || 0);
    const tradePL = (sell - buy) * qty;
    cumulativePL += tradePL;

    return {
      name: `Trade ${index + 1}`,
      ticker: (t.ticker || t.symbol || '').toUpperCase(),
      pl: parseFloat(cumulativePL.toFixed(2))
    };
  });

  // 2. Process trades for Asset Allocation Pie Chart
  const allocationMap = {};
  trades.forEach(t => {
    const symbol = (t.ticker || t.symbol || '').toUpperCase();
    const qty = parseFloat(t.shares || t.quantity || 0);
    const price = parseFloat(t.buy_price || t.price || 0);
    const value = qty * price;

    if (symbol) {
      allocationMap[symbol] = (allocationMap[symbol] || 0) + value;
    }
  });

  const pieData = Object.keys(allocationMap).map(symbol => ({
    name: symbol,
    value: parseFloat(allocationMap[symbol].toFixed(2))
  }));

  if (trades.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Cumulative P&L Area Chart */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">
          Cumulative P&L Growth ($)
        </h3>
        {pnlData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="plGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value) => [`$${value}`, 'Cumulative P&L']}
                />
                <Area type="monotone" dataKey="pl" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#plGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500">
            Close a position to generate P&L growth history.
          </div>
        )}
      </div>

      {/* Asset Allocation Pie Chart */}
      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">
          Asset Allocation
        </h3>
        {pieData.length > 0 ? (
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value) => [`$${value}`, 'Invested Capital']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500">
            No active holdings to display.
          </div>
        )}
      </div>
    </div>
  );
}