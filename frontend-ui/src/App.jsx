import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from "./pages/login";
import Register from './pages/register';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  useEffect(() => {
    // Check local token on mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    // Set up global Axios interceptor for expired/invalid tokens
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor when App unmounts
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // 1. Show Dashboard if logged in
  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  // 2. Show Register page if user clicked "Sign Up"
  if (currentView === 'register') {
    return <Register onSwitchToLogin={() => setCurrentView('login')} />;
  }

  // 3. Default: Show Login page
  return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView('register')} />;
}

export default App;