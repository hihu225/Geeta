import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import your components
import Login from './Login';
import Signup from './Signup';
import BhagavadGitaBot from './Chatbot';
// Import your existing chatbot components here
// import Dashboard from './components/Dashboard';
// import ChatInterface from './components/ChatInterface';

// Context for user authentication
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Set up axios defaults
  useEffect(() => {
    // Set base URL for API calls
    axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
    
    // Check for existing token and validate it
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && userData) {
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        const response = await axios.get('/api/auth/me');
        
        if (response.data.success) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (userData, token, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(userData));
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Optional: notify backend about logout
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const updateUser = (updatedUserData) => {
    const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px' 
        }}>
          Loading...
        </div>
      );
    }
    
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Public Route Component (redirect to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px' 
        }}>
          Loading...
        </div>
      );
    }
    
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
  };

  const authContextValue = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    loading
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {/* Replace with your Dashboard component */}
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Welcome to Dashboard!</h1>
                    <p>Hello, {user?.name}!</p>
                    <button 
                      onClick={logout}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Add your existing chatbot routes here */}
            
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <BhagavadGitaBot />
                </ProtectedRoute>
              } 
            />
            

            {/* Default redirect */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Navigate to="/login" replace />
              } 
            />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100vh',
                  flexDirection: 'column' 
                }}>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;