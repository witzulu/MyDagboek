import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../services/api';

export const AuthContext = createContext();

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('theme'); // Clear theme on logout
    setToken(null);
    setUser(null);
    setNotifications([]);
    // Redirect to login page
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [logout]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api('/notifications');
      setNotifications(data);
    } catch (error) {
      // Error is handled by the api service interceptor
    }
  }, [token]);

  useEffect(() => {
    try {
      if (token) {
        const decodedToken = decodeJwt(token);
        setUser(decodedToken.user);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, fetchNotifications, logout]);

  const login = (newToken) => {
    const decoded = decodeJwt(newToken);
    if (decoded?.user?.theme) {
      localStorage.setItem('theme', decoded.user.theme);
    }
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Force a reload to ensure all contexts are reset and the new theme is applied
    window.location.reload();
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    notifications,
    fetchNotifications,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
