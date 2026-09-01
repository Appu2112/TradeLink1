import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPage from './pages/LandingPage';
import Login from "./pages/login";
import Register from './pages/register';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentView('landing');
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

  // 2. Show Register page
  if (currentView === 'register') {
    return <Register onSwitchToLogin={() => setCurrentView('login')} />;
  }

  // 3. Show standalone Login page
  if (currentView === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView('register')} />;
  }

  // 4. Default view: Landing Page
  return (
    <LandingPage 
      onLoginSuccess={handleLoginSuccess} 
      onSwitchToLogin={() => setCurrentView('login')}
      onSwitchToRegister={() => setCurrentView('register')}
    />
  );
}

export default App;