import React, { useState } from 'react';
import axios from 'axios';
import { 
  Search, TrendingUp, Megaphone, Repeat, 
  PiggyBank, Droplets, BarChart2, Calculator, ChevronRight, X, Loader2 
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Controls toggle between Login & Register view
  const [loginType, setLoginType] = useState('mobile');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Open modal in Login mode
  const openLoginModal = () => {
    setIsRegisterMode(false);
    setError('');
    setIsLoginOpen(true);
  };

  // Open modal in Create Account mode
  const openRegisterModal = () => {
    setIsRegisterMode(true);
    setError('');
    setIsLoginOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || 'https://tradelink1-43ev.onrender.com';
    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, {
        email: identifier,
        password: password,
      });

      if (!isRegisterMode) {
        localStorage.setItem('token', response.data.token);
        setIsLoginOpen(false);
        if (onLoginSuccess) onLoginSuccess();
      } else {
        // Switch back to login mode after successful account creation
        setIsRegisterMode(false);
        setError('Account created successfully! Please sign in.');
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

  const topStocks = [
    'IRFC share price', 'Suzlon share price', 'IREDA share price', 'Tata Motors share price',
    'Yes Bank share price', 'HDFC Bank share price', 'NHPC share price', 'RVNL share price',
    'SBI share price', 'Tata Power share price', 'Tata Steel share price', 'Adani Power share price',
    'PNB share price', 'Eternal Share Price', 'BEL share price', 'Reliance Share Price',
    'Infosys share price', 'ITC share price', 'Jio Finance share price', 'LIC share price'
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* 1. Header Navigation */}
      <header className="border-b border-gray-800 bg-[#12151c]/90 sticky top-0 z-40 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-500 tracking-wide">
            <span className="text-2xl">▲</span> AngelOne
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

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        
        {/* 2. Hero Section */}
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
              <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">AngelOne App</span>
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

        {/* 3. Transparent Pricing Grid */}
        <section className="text-center">
          <h2 className="text-xl md:text-2xl font-bold tracking-wide uppercase mb-8 flex items-center justify-center gap-2">
            <span className="text-blue-400">✦</span> Transparent Pricing. No Hidden Charges <span className="text-blue-400">✦</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { fee: '₹0', label: 'Account Opening Charges' },
              { fee: '₹0', label: '0 Brokerage* across segments for first 30 days up to ₹500.' },
              { fee: '₹0', label: 'Interest for MTF for first 30 days' },
              { fee: '₹0', label: '0 Commission on Mutual Funds & IPO Investments' },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#151821] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-500/40 transition">
                <span className="text-4xl font-extrabold text-white mb-3">{item.fee}</span>
                <p className="text-xs text-gray-400 leading-relaxed text-center">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Preferred Investments Grid */}
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

        {/* 5. Calculators Banner */}
        <section className="bg-[#151821] border border-gray-800/80 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Calculate Brokerage & Margin easily</h2>
            <div className="flex flex-wrap gap-3">
              {['SIP Calculator', 'Brokerage Calculator', 'Margin Calculator'].map((calc, idx) => (
                <button key={idx} className="bg-[#1c202b] hover:bg-gray-800 border border-gray-700/60 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 transition">
                  {calc} <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <Calculator className="w-12 h-12 text-blue-400" />
          </div>
        </section>

        {/* 6. Top Stocks Table Grid */}
        <section className="text-center">
          <h2 className="text-xl font-bold mb-6">Top 20 Stocks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-800 rounded-xl overflow-hidden divide-x divide-y divide-gray-800 bg-[#12151c]">
            {topStocks.map((stock, idx) => (
              <div key={idx} className="p-4 text-xs font-medium text-gray-300 hover:bg-[#1a1e29] hover:text-blue-400 cursor-pointer transition">
                {stock}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 7. Authentication Overlay Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#12141a] border border-gray-800 rounded-2xl p-8 shadow-2xl text-white">
            
            <button 
              onClick={() => setIsLoginOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 font-bold text-xl text-blue-500 tracking-wide">
                <span className="text-2xl">▲</span> AngelOne
              </div>
              <div className="mt-4 border-b border-dashed border-gray-800" />
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-6">
              {isRegisterMode ? 'Create your AngelOne account' : 'Welcome to India’s fastest investment platform!'}
            </h2>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs text-center mb-4">
                {error}
              </div>
            )}

            {!isRegisterMode && (
              <div className="flex items-center gap-6 mb-4 text-xs font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="modalLoginType" 
                    checked={loginType === 'mobile'} 
                    onChange={() => setLoginType('mobile')}
                    className="accent-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className={loginType === 'mobile' ? 'text-white' : 'text-gray-400'}>
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
                  <span className={loginType === 'client' ? 'text-white' : 'text-gray-400'}>
                    Login with Client ID
                  </span>
                </label>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="text"
                  required
                  placeholder={
                    isRegisterMode 
                      ? 'Mobile Number / Email' 
                      : (loginType === 'mobile' ? 'Mobile Number / Email' : 'Client ID')
                  }
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
                className="w-full bg-[#272b35] hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#272b35] text-white font-bold text-xs tracking-wider uppercase py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRegisterMode ? 'REGISTER' : 'PROCEED')}
              </button>
            </form>

            <div className="mt-8 pt-4 text-center border-t border-gray-800">
              {isRegisterMode ? (
                <p className="text-xs text-gray-400">
                  Already have an account?{' '}
                  <button 
                    onClick={() => { setIsRegisterMode(false); setError(''); }}
                    className="text-blue-500 hover:underline font-medium cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => { setIsRegisterMode(true); setError(''); }}
                    className="text-blue-500 hover:underline font-medium cursor-pointer"
                  >
                    Register Now!
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}