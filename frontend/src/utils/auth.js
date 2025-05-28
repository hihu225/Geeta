// utils/auth.js
import axios from "axios";
import { StorageService } from "./storage";
import { backend_url } from "./backend";

export const AuthUtils = {
  // Initialize axios with stored token
  async initializeAxios() {
    try {
      const token = await StorageService.get("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return token;
      }
      return null;
    } catch (error) {
      console.error("Error initializing axios:", error);
      return null;
    }
  },

  // Get current user token
  async getToken() {
    try {
      return await StorageService.get("token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await StorageService.get("token");
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },

  // Verify token with backend
  async verifyToken() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(`${backend_url}/api/auth/me`);
      
      return response.data.success;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  },

  // Logout user completely
  async logout() {
    try {
      // Clear all auth-related storage
      await StorageService.remove("token");
      await StorageService.remove("saved_email");
      await StorageService.remove("saved_password");
      await StorageService.remove("remember_me");
      
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.setItem("loggedOut", "true");
      
      // Clear axios header
      delete axios.defaults.headers.common["Authorization"];
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  },

  // Get stored user data
  getUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  // Set user data
  setUser(userData) {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Error setting user data:", error);
      return false;
    }
  }
};