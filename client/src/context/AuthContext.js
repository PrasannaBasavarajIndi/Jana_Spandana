// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 1. Create the context
const AuthContext = createContext();

// 2. Create a "provider" component
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info when token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { 'x-auth-token': token }
          });
          setUser(res.data);
        } catch (err) {
          console.error('Error fetching user:', err);
          // Token might be invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  // 3. Function to save token on login/signup
  const setAuthToken = async (newToken) => {
    localStorage.setItem('token', newToken); // Save to browser storage
    setToken(newToken);
    // Set the token in axios headers for all future requests
    if (newToken) {
      axios.defaults.headers.common['x-auth-token'] = newToken;
      // Fetch user info
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      setUser(null);
    }
  };

  // 4. Function for logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  // 5. Value to be passed to consuming components
  const value = {
    token,
    user,
    loading,
    setAuthToken,
    logout,
    isSupervisor: user?.role === 'SUPERVISOR',
    isAdmin: user?.role === 'ADMIN',
    isWorker: user?.role === 'WORKER',
    isCitizen: user?.role === 'CITIZEN' || !user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 6. Create a custom hook to use the context easily
export function useAuth() {
  return useContext(AuthContext);
}