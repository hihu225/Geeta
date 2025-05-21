"use client";

import { createContext, useContext, useEffect, useReducer } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'AUTH_FAIL':
      return { ...state, user: null, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkCurrentUser = async () => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { data } = await axios.get('http://localhost:5000/auth/current', {
        withCredentials: true
      });
      dispatch({ type: 'AUTH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: error.response?.data?.error || 'Not authenticated' });
    }
  };

  const googleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const logout = async () => {
    try {
      await axios.get('http://localhost:5000/auth/logout', { withCredentials: true });
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: error.message });
    }
  };

  useEffect(() => {
    checkCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        googleLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};