import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

  // Add Authorization header to all requests
  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Handle unauthorized responses
  axios.interceptors.response.use(
    res => res,
    err => {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );

  // Verify token on load
  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const res = await axios.post('/api/auth/verify-token', { token });
        if (res.data.success) {
          const userRes = await axios.get('/api/auth/user');
          setUser(userRes.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Google OAuth login
  const login = () => {
    window.location.href = `${axios.defaults.baseURL}/api/auth/google`;
  };

  // Email/password login
  const emailLogin = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      await verifyAndSetUser(token);
    } catch (err) {
      console.error('Email login failed:', err);
      setError('Invalid credentials');
    }
  };

  // Email/password registration
  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      await verifyAndSetUser(token);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed');
    }
  };

  // Helper to verify token and fetch user
  const verifyAndSetUser = async (token) => {
    try {
      const res = await axios.post('/api/auth/verify-token', { token });
      if (res.data.success) {
        const userRes = await axios.get('/api/auth/user');
        setUser(userRes.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify and set user:', err);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,         // Google OAuth
        emailLogin,    // Email login
        register,      // Email register
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
