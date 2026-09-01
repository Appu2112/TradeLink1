import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, TrendingUp, Megaphone, Repeat, 
  PiggyBank, Droplets, BarChart2, X, Loader2 
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginType, setLoginType] = useState('mobile');

  // Dynamic Stock Data State
  const [topStocks, setTopStocks] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(true);

  // Form State
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://tradelink1-43ev.onrender.com';

  // Fetch real live top stock data dynamically
  useEffect(() => {
    const fetchLiveStocks = async () => {
      // Tickers for top Indian liquid stocks on NSE
      const tickers = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'TATAMOTORS.NS', 'AXISBANK.NS',
        'KOTAKBANK.NS', 'LT.NS', 'HCLTECH.NS', 'SUNPHARMA.NS', 'MARUTI.NS',
        'NTPC.NS', 'ONGC.NS', 'ULTRACEMCO.NS', 'POWERGRID.NS', 'TITAN.NS'
      ];

      try {
        // Attempt 1: Fetch from Yahoo Finance live endpoint directly
        const symbolList = tickers.join(',');
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolList}`
        );

        const quoteResults = response?.data?.quoteResponse?.result || [];
        
        if (quoteResults.length > 0) {
          const parsedStocks = quoteResults.map((item) => ({
            symbol: item.symbol.replace('.NS', ''),
            name: item.shortName || item.longName || item.symbol.replace('.NS', ''),
            price: item.regularMarketPrice ? item.regularMarketPrice.toFixed(2) : null,
            changePercent: item.regularMarketChangePercent ? item.regularMarketChangePercent.toFixed(2) : null
          }));

          setTopStocks(parsedStocks);
          return;
        }
      } catch (err) {
        console.warn('Direct live finance API hindered, switching to cors-proxied endpoint source...');
      }

      try {
        // Attempt 2: Fallback to dynamic public JSON proxy for Indian equities
        const fallbackRes = await axios.get(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers.join(',')}`
          )}`
        );

        const quoteResults = fallbackRes?.data?.quoteResponse?.result || [];
        if (quoteResults.length > 0) {
          const parsedStocks = quoteResults.map((item) => ({
            symbol: item.symbol.replace('.NS', ''),
            name: item.shortName || item.symbol.replace('.NS', ''),
            price: item.regularMarketPrice ? item.regularMarketPrice.toFixed(2) : null,
            changePercent: item.regularMarketChangePercent ? item.regularMarketChangePercent.toFixed(2) : null
          }));

          setTopStocks(parsedStocks);
          return;
        }
      } catch (fallbackErr) {
        console.warn('Using live stock structure fallback.');
        setTopStocks(
          tickers.map((t) => ({
            symbol: t.replace('.NS', ''),
            name: t.replace('.NS', ''),
            price: null
          }))
        );
      } finally {
        setStocksLoading(false);
      }
    };

    fetchLiveStocks();
  }, []);

  const openLoginModal = () => {
    setIsRegisterMode(false);
    setError('');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setIsRegisterMode(true);
    setError('');
    setIsAuthModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await axios.post(`${API_URL}/api/auth/register`, {
          username,
          email: identifier,
          password,
        });
        setIsRegisterMode(false);
        setError('');
        alert('Account created successfully! Please sign in.');
      } else {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          email: identifier,
          password,
        });

        localStorage.setItem('token', response.data.token);
        setIsAuthModalOpen(false);
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const investments = [
    { title: 'STOCKS', desc: 'Own a part of renowned companies and enjoy capital appreciation.', icon: TrendingUp, color: 'text-emerald-400' },
    { title: 'IPO', desc: 'Secure part ownership in new ventures and seize high growth potential.', icon: Megaphone, color: 'text-amber-400' },
    { title: 'F&O', desc: 'Navigate market volatility, manage risk and amplify returns with F&O trading.', icon: Repeat, color: 'text-rose-400' },
    { title: 'MUTUAL FUNDS', desc: 'Invest in professionally managed portfolios for steady growth.', icon: PiggyBank, color: 'text-orange-400' },
    { title: 'COMMODITIES', desc: 'Trade in metals, gold, oil, and more to hedge risk and enhance your portfolio.', icon: Droplets, color: 'text-indigo-400' },
    { title: 'US STOCK', desc: 'Seize global opportunities by investing in the world’s largest economy.', icon: BarChart2, color: 'text-cyan-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Navigation Header */}
      <header className="border-b border-gray-800 bg-[#12151c]/90 sticky top-0 z-40 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-500 tracking-wide">
            <span className="text-2xl">▲</span> TradeLink
          </div>
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Stocks, News, Reports..." 
              className="w-full bg-[#1c2029] text-xs text-gray-200 pl-9 pr-4 py-2 rounded-md border border-gray-700/60 focus:outline-none focus:border-blue-500"
            />
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#trade" className="hover:text-white transition">Trade & Invest</a>
            <a href="#funds" className="hover:text-white transition">Mutual Funds & SIP</a>
            <a href="#learn" className="hover:text-white transition">Learn</a>
            <a href="#news" className="hover:text-white transition">News</a>
            <a href="#products" className="hover:text-white transition">Products</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openRegisterModal}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition cursor-pointer"
          >
            Create Account
          </button>
          <button 
            onClick={openLoginModal}
            className="border border-gray-700 hover:bg-gray-800 text-gray-200 text-xs font-semibold px-4 py-2 rounded-md transition cursor-pointer"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        
        {/* Hero Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#171a21] border border-gray-800/80 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                Your One-Stop Investment Platform
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                A trusted partner with 30 years of experience
              </p>

              <div className="flex gap-2 mb-8">
                <div className="flex items-center bg-[#101216] border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-gray-400">
                  +91
                </div>
                <input 
                  type="text" 
                  placeholder="Enter your mobile number" 
                  className="flex-1 bg-[#101216] border border-gray-700/60 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
                <button 
                  onClick={openRegisterModal}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800/60">
              <div>
                <p className="text-lg font-bold">₹0</p>
                <p className="text-[11px] text-gray-400">Account Opening Charges</p>
              </div>
              <div>
                <p className="text-lg font-bold">3.8Cr+</p>
                <p className="text-[11px] text-gray-400">Users</p>
              </div>
              <div>
                <p className="text-lg font-bold">₹0</p>
                <p className="text-[11px] text-gray-400">AMC for 1st Year</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-950/40 border border-blue-800/30 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">TradeLink App</span>
              <h2 className="text-2xl font-bold mt-2">Your Stock Market Journey Starts Here</h2>
              <p className="text-gray-400 text-xs mt-1">Stocks | ETFs | IPO | Mutual Funds</p>
            </div>
            <div className="mt-8 flex justify-center">
              <button 
                onClick={openRegisterModal}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer"
              >
                Open Demat Account
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Top Stocks Grid */}
        <section className="text-center">
          <h2 className="text-xl font-bold mb-6">Top 20 Live Stocks</h2>
          
          {stocksLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : topStocks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-800 rounded-xl overflow-hidden divide-x divide-y divide-gray-800 bg-[#12151c]">
              {topStocks.map((stock, idx) => (
                <div 
                  key={idx} 
                  className="p-4 flex flex-col justify-center items-center text-xs font-medium text-gray-300 hover:bg-[#1a1e29] hover:text-blue-400 cursor-pointer transition gap-1"
                >
                  <span className="font-semibold text-white">{stock.name}</span>
                  {stock.price ? (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-gray-300">₹{stock.price}</span>
                      {stock.changePercent && (
                        <span className={Number(stock.changePercent) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {Number(stock.changePercent) >= 0 ? `+${stock.changePercent}%` : `${stock.changePercent}%`}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500">share price</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No stock data available</p>
          )}
        </section>

        {/* Investment Options */}
        <section>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">PICK YOUR PREFERRED INVESTMENT</h2>
          <p className="text-gray-400 text-sm mb-8">Discover our extensive array of investment options, from stocks and bonds to mutual funds and more.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {investments.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-[#151821] border border-gray-800/80 rounded-xl p-6 hover:border-blue-500/50 hover:bg-[#1a1e29] transition group cursor-pointer">
                  <div className={`p-3 rounded-lg bg-gray-800/40 w-fit mb-4 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-blue-400 transition">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#12141a] border border-gray-800 rounded-2xl p-8 shadow-2xl text-white">
            
            <button 
              onClick={() => setIsAuthModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs text-center mb-4">
                {error}
              </div>
            )}

            {isRegisterMode ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Create Account</h2>
                  <p className="text-xs text-gray-400 mt-1">Sign up to start trading</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-medium">Username</label>
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-medium">Email</label>
                    <input 
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-medium">Password</label>
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00e611] hover:bg-[#00c80e] text-black font-bold text-sm py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-400">
                    Already have an account?{' '}
                    <button 
                      onClick={() => { setIsRegisterMode(false); setError(''); }}
                      className="text-[#00e611] hover:underline font-medium cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-6 text-xs font-medium text-gray-300 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="modalLoginType" 
                      checked={loginType === 'mobile'} 
                      onChange={() => setLoginType('mobile')}
                      className="accent-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={loginType === 'mobile' ? 'text-white font-semibold' : 'text-gray-400'}>
                      Login with Mobile / Email
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="modalLoginType" 
                      checked={loginType === 'client'} 
                      onChange={() => setLoginType('client')}
                      className="accent-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={loginType === 'client' ? 'text-white font-semibold' : 'text-gray-400'}>
                      Login with Client ID
                    </span>
                  </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input 
                      type="text"
                      required
                      placeholder={loginType === 'mobile' ? 'Mobile Number / Email' : 'Client ID'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <input 
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || !identifier || !password}
                    className="w-full bg-[#272b35] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'PROCEED'}
                  </button>
                </form>

                <div className="pt-4 text-center border-t border-gray-800">
                  <p className="text-xs text-gray-400">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => { setIsRegisterMode(true); setError(''); }}
                      className="text-blue-500 hover:underline font-medium cursor-pointer"
                    >
                      Register Now!
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}