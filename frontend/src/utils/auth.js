import { Preferences } from '@capacitor/preferences';
import axios from 'axios';

// Storage helper functions with expiration
export const setStorageItem = async (key, value, expirationDays = 7) => {
  try {
    const expirationTime = Date.now() + (expirationDays * 24 * 60 * 60 * 1000);
    await Preferences.set({
      key: key,
      value: JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expires: expirationTime
      })
    });
  } catch (error) {
    console.error('Error saving to storage:', error);
    // Fallback to localStorage for web
    const expirationTime = Date.now() + (expirationDays * 24 * 60 * 60 * 1000);
    localStorage.setItem(key, JSON.stringify({
      data: value,
      timestamp: Date.now(),
      expires: expirationTime
    }));
  }
};

export const getStorageItem = async (key) => {
  try {
    const { value } = await Preferences.get({ key: key });
    if (value) {
      const parsed = JSON.parse(value);
      // Check if item has expired
      if (parsed.expires && Date.now() > parsed.expires) {
        await removeStorageItem(key);
        return null;
      }
      return parsed.data;
    }
    return null;
  } catch (error) {
    console.error('Error reading from storage:', error);
    // Fallback to localStorage for web
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.expires && Date.now() > parsed.expires) {
          localStorage.removeItem(key);
          return null;
        }
        return parsed.data;
      }
    } catch (e) {
      console.error('Fallback storage error:', e);
    }
    return null;
  }
};

export const removeStorageItem = async (key) => {
  try {
    await Preferences.remove({ key: key });
  } catch (error) {
    console.error('Error removing from storage:', error);
    // Fallback to localStorage for web
    localStorage.removeItem(key);
  }
};

export const clearAllAuthData = async () => {
  const keys = ['token', 'user', 'saved_email', 'saved_password', 'remember_me'];
  for (const key of keys) {
    await removeStorageItem(key);
  }
  // Clear axios default header
  delete axios.defaults.headers.common['Authorization'];
};

export const isAuthenticated = async () => {
  const token = await getStorageItem('token');
  const user = await getStorageItem('user');
  return !!(token && user);
};

export const getAuthToken = async () => {
  return await getStorageItem('token');
};

export const getAuthUser = async () => {
  return await getStorageItem('user');
};

export const setAuthData = async (token, user, rememberMe = false) => {
  const expirationDays = rememberMe ? 30 : 7;
  await setStorageItem('token', token, expirationDays);
  await setStorageItem('user', user, expirationDays);
  
  // Set axios default header
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const logout = async () => {
  await clearAllAuthData();
};