import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthToken, getAuthUser, clearAllAuthData } from './utils/auth';
import { backend_url } from './utils/backend';
import axios from 'axios';

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await getAuthToken();
        const user = await getAuthUser();

        if (token && user) {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid
          try {
            const response = await axios.get(`${backend_url}/api/auth/verify-token`);
            if (response.data.success) {
              setIsAuthenticated(true);
              
              // If user is on login/signup page and is authenticated, redirect to chat
              if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
                navigate('/chat', { replace: true });
              }
            } else {
              throw new Error('Token verification failed');
            }
          } catch (error) {
            console.log('Token expired or invalid, clearing auth data');
            await clearAllAuthData();
            setIsAuthenticated(false);
            
            // Redirect to login if on protected route
            if (location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/') {
              navigate('/login', { replace: true });
            }
          }
        } else {
          setIsAuthenticated(false);
          
          // Redirect to login if on protected route
          if (location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/') {
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        await clearAllAuthData();
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [navigate, location.pathname]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>🚀</div>
          <div style={{
            fontSize: '18px',
            color: '#666'
          }}>Loading...</div>
        </div>
      </div>
    );
  }

  return children;
};

export default AppInitializer;