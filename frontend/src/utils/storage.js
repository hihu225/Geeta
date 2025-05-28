// utils/storage.js
import { Capacitor } from '@capacitor/core';
import Cookies from 'js-cookie';

class StorageServiceClass {
  constructor() {
    this.Preferences = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  // Initialize the Preferences plugin
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    if (this.isInitialized) {
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        console.log('[StorageService] Initializing Preferences for native platform');
        const module = await import('@capacitor/preferences');
        this.Preferences = module.Preferences;
        console.log('[StorageService] Preferences loaded successfully');
      } else {
        console.log('[StorageService] Running on web platform, using cookies');
      }
    } catch (error) {
      console.warn('[StorageService] Failed to load Preferences plugin:', error);
      this.Preferences = null;
    }

    this.isInitialized = true;
  }

  // Check if Preferences is available
  isPreferencesAvailable() {
    return Capacitor.isNativePlatform() && this.Preferences !== null;
  }

  // Set a value with optional expiration
  async set(key, value, options = {}) {
    await this.init(); // Ensure initialization

    try {
      if (this.isPreferencesAvailable()) {
        // For Capacitor, store as JSON with metadata including expiry
        const data = {
          value,
          expires: options.expires ? Date.now() + (options.expires * 24 * 60 * 60 * 1000) : null,
          timestamp: Date.now()
        };
        await this.Preferences.set({
          key,
          value: JSON.stringify(data)
        });
        console.log(`[StorageService] Set ${key} in Preferences:`, data);
      } else {
        // For web or when Preferences is not available, use js-cookie
        const cookieOptions = {};
        if (options.expires) cookieOptions.expires = options.expires;
        if (options.sameSite) cookieOptions.sameSite = options.sameSite;
        if (options.secure) cookieOptions.secure = options.secure;
        
        Cookies.set(key, value, cookieOptions);
        console.log(`[StorageService] Set ${key} in Cookies:`, value);
      }
    } catch (error) {
      console.error('[StorageService] Storage set error:', error);
      // Fallback to cookies if Preferences fails
      try {
        Cookies.set(key, value, options);
        console.log(`[StorageService] Fallback: Set ${key} in Cookies`);
      } catch (fallbackError) {
        console.error('[StorageService] Fallback storage also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  // Get a value
  async get(key) {
    await this.init(); // Ensure initialization

    try {
      if (this.isPreferencesAvailable()) {
        const result = await this.Preferences.get({ key });
        console.log(`[StorageService] Get ${key} from Preferences:`, result);
        
        if (!result.value) return null;
        
        const data = JSON.parse(result.value);
        
        // Check if expired
        if (data.expires && Date.now() > data.expires) {
          console.log(`[StorageService] ${key} expired, removing`);
          await this.remove(key);
          return null;
        }
        
        console.log(`[StorageService] Retrieved ${key}:`, data.value);
        return data.value;
      } else {
        const value = Cookies.get(key) || null;
        console.log(`[StorageService] Get ${key} from Cookies:`, value);
        return value;
      }
    } catch (error) {
      console.error('[StorageService] Storage get error:', error);
      // Fallback to cookies
      try {
        const value = Cookies.get(key) || null;
        console.log(`[StorageService] Fallback: Get ${key} from Cookies:`, value);
        return value;
      } catch (fallbackError) {
        console.error('[StorageService] Fallback storage also failed:', fallbackError);
        return null;
      }
    }
  }

  // Remove a value
  async remove(key) {
    await this.init(); // Ensure initialization

    try {
      if (this.isPreferencesAvailable()) {
        await this.Preferences.remove({ key });
        console.log(`[StorageService] Removed ${key} from Preferences`);
      } else {
        Cookies.remove(key);
        console.log(`[StorageService] Removed ${key} from Cookies`);
      }
    } catch (error) {
      console.error('[StorageService] Storage remove error:', error);
      // Fallback to cookies
      try {
        Cookies.remove(key);
        console.log(`[StorageService] Fallback: Removed ${key} from Cookies`);
      } catch (fallbackError) {
        console.error('[StorageService] Fallback remove also failed:', fallbackError);
      }
    }
  }

  // Clear all values
  async clear() {
    await this.init(); // Ensure initialization

    try {
      if (this.isPreferencesAvailable()) {
        await this.Preferences.clear();
        console.log(`[StorageService] Cleared all Preferences`);
      } else {
        // For cookies, we'd need to iterate through all cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        console.log(`[StorageService] Cleared all Cookies`);
      }
    } catch (error) {
      console.error('[StorageService] Storage clear error:', error);
    }
  }

  // Get all keys
  async keys() {
    await this.init(); // Ensure initialization

    try {
      if (this.isPreferencesAvailable()) {
        const result = await this.Preferences.keys();
        return result.keys || [];
      } else {
        // For web, return cookie names (simplified)
        return document.cookie.split(';').map(cookie => 
          cookie.split('=')[0].trim()
        ).filter(name => name);
      }
    } catch (error) {
      console.error('[StorageService] Storage keys error:', error);
      return [];
    }
  }

  // Debug function to check what's stored
  async debug() {
    await this.init(); // Ensure initialization

    try {
      console.log(`[StorageService] Platform: ${Capacitor.getPlatform()}`);
      console.log(`[StorageService] Is Native: ${Capacitor.isNativePlatform()}`);
      console.log(`[StorageService] Preferences Available: ${this.isPreferencesAvailable()}`);
      console.log(`[StorageService] Is Initialized: ${this.isInitialized}`);
      
      if (this.isPreferencesAvailable()) {
        const keys = await this.keys();
        console.log('[StorageService] All stored keys:', keys);
        for (const key of keys) {
          const value = await this.get(key);
          console.log(`[StorageService] ${key}:`, value);
        }
      } else {
        console.log('[StorageService] All cookies:', document.cookie);
      }
    } catch (error) {
      console.error('[StorageService] Storage debug error:', error);
    }
  }
}

// Export a singleton instance
export const StorageService = new StorageServiceClass();