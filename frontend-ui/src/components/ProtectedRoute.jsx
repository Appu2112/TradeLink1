import React from 'react';

function ProtectedRoute({ children, onLogout }) {
  const token = localStorage.getItem('token');

  // If no token exists, immediately trigger logout / redirect to login
  if (!token) {
    onLogout();
    return null;
  }

  return children;
}

export default ProtectedRoute;