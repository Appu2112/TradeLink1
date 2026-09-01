import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [loginType, setLoginType] = useState('mobile'); // 'mobile' or 'client'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://tradelink1-43ev.onrender.com';

      // Send payload with the identifier (email/mobile/client ID) and password
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: identifier,
        password: password,
      });

      // Save JWT token
      localStorage.setItem('token', response.data.token);
      
      // Notify parent component
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#12141a] border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
        
        {/* Logo & Header */}
        <div>
          <div className="flex items-center gap-2 font-bold text-xl text-blue-500 tracking-wide">
            <span className="text-2xl">▲</span> TradeLink
          </div>
          <div className="mt-4 border-b border-dashed border-gray-800" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white">
          Welcome to India’s fastest investment platform!
        </h2>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs text-center">
            {error}
          </div>
        )}

        {/* Option Radio Controls */}
        <div className="flex items-center gap-6 text-xs font-medium text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="loginType" 
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
              name="loginType" 
              checked={loginType === 'client'} 
              onChange={() => setLoginType('client')}
              className="accent-blue-500 w-4 h-4 cursor-pointer"
            />
            <span className={loginType === 'client' ? 'text-white font-semibold' : 'text-gray-400'}>
              Login with Client ID
            </span>
          </label>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={loginType === 'mobile' ? 'Mobile Number / Email' : 'Client ID'}
              className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !identifier || !password}
            className="w-full bg-[#272b35] hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#272b35] text-white font-bold text-xs tracking-wider uppercase py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'PROCEED'}
          </button>
        </form>

        {/* Register Navigation */}
        <div className="pt-4 text-center border-t border-gray-800/80">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-500 hover:underline font-medium focus:outline-none cursor-pointer"
            >
              Register Now!
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;