import React, { useState, useEffect } from 'react';
import Login from "./pages/login";
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentView('login');
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