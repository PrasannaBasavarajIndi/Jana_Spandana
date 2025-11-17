// src/components/layout/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    // If no token, redirect to the /login page
    return <Navigate to="/login" />;
  }

  // If there is a token, render the child component (the page)
  return children;
}

export default ProtectedRoute;