import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function LoginModal({ isOpen = true, onClose }) {
  const [loginType, setLoginType] = useState('mobile'); // 'mobile' or 'client'
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', { loginType, inputValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md bg-[#12141a] border border-gray-800 rounded-2xl p-8 shadow-2xl text-white">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo & Divider */}
        <div className="mb-6">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-500 tracking-wide">
            <span className="text-2xl">▲</span> AngelOne
          </div>
          <div className="mt-4 border-b border-dashed border-gray-800" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight mb-6">
          Welcome to India’s fastest investment platform!
        </h2>

        {/* Login Type Selector */}
        <div className="flex items-center gap-6 mb-4 text-sm font-medium">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="loginType" 
              checked={loginType === 'mobile'} 
              onChange={() => {
                setLoginType('mobile');
                setInputValue('');
              }}
              className="accent-blue-500 w-4 h-4 cursor-pointer"
            />
            <span className={loginType === 'mobile' ? 'text-white' : 'text-gray-400'}>
              Login with Mobile Number
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="loginType" 
              checked={loginType === 'client'} 
              onChange={() => {
                setLoginType('client');
                setInputValue('');
              }}
              className="accent-blue-500 w-4 h-4 cursor-pointer"
            />
            <span className={loginType === 'client' ? 'text-white' : 'text-gray-400'}>
              Login with Client ID
            </span>
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type={loginType === 'mobile' ? 'tel' : 'text'}
              placeholder={loginType === 'mobile' ? 'Mobile Number' : 'Client ID'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-[#181b22] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="w-full bg-[#272b35] hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#272b35] text-white font-semibold text-sm py-3 rounded-lg transition cursor-pointer"
          >
            PROCEED
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-8 pt-4 text-center border-t border-gray-800">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <a href="#register" className="text-blue-500 hover:underline font-medium">
              Register Now!
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}