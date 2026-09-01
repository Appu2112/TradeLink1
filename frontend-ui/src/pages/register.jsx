import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://tradelink1-43ev.onrender.com';

      await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#12141a] border border-gray-800/80 p-8 rounded-2xl shadow-2xl space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-xs text-gray-400 mt-1">Sign up to start trading</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {/* Footer Toggle */}
        <div className="pt-2 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#00e611] hover:underline font-medium focus:outline-none cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;