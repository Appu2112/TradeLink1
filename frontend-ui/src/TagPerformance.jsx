import React from 'react';
import { Tag, TrendingUp, TrendingDown } from 'lucide-react';

export default function TagPerformance({ trades }) {
  // Aggregate stats by tag
  const tagStats = trades.reduce((acc, t) => {
    const tagName = t.tag || 'Untagged';
    const sell = t.sell_price || (t.action === 'SELL' ? t.price : null);
    const buy = t.buy_price || t.price;
    const qty = t.shares || t.quantity || 0;
    
    if (!acc[tagName]) {
      acc[tagName] = { name: tagName, totalTrades: 0, closedTrades: 0, wins: 0, pnl: 0 };
    }

    acc[tagName].totalTrades += 1;

    if (sell !== null && sell !== undefined) {
      const tradePnL = (parseFloat(sell) - parseFloat(buy)) * parseFloat(qty);
      acc[tagName].closedTrades += 1;
      acc[tagName].pnl += tradePnL;
      if (tradePnL > 0) acc[tagName].wins += 1;
    }

    return acc;
  }, {});

  const statsArray = Object.values(tagStats);

  if (statsArray.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Tag className="w-5 h-5 text-emerald-400" />
        <h2 className="text-base font-bold text-slate-200">Setup Breakdown</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {statsArray.map((item) => {
          const winRate = item.closedTrades > 0 
            ? ((item.wins / item.closedTrades) * 100).toFixed(0) 
            : 0;

          return (
            <div key={item.name} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-300 uppercase bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {item.name}
                </span>
                <p className="text-xs text-slate-400 pt-1">
                  {item.totalTrades} Trades | <span className="text-slate-200 font-semibold">{winRate}% Win</span>
                </p>
              </div>

              <div className="text-right">
                <p className={`text-sm font-bold flex items-center justify-end gap-1 ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.pnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {item.pnl >= 0 ? `+$${item.pnl.toFixed(2)}` : `-$${Math.abs(item.pnl).toFixed(2)}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}