import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./login.css";
import { backend_url } from "./utils/backend";
import swal from "sweetalert2";
import { Preferences } from '@capacitor/preferences';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  // Storage helper functions
  const setStorageItem = async (key, value) => {
    try {
      await Preferences.set({
        key: key,
        value: JSON.stringify({
          data: value,
          timestamp: Date.now(),
          expires: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (7 * 24 * 60 * 60 * 1000) // 30 days or 7 days
        })
      });
    } catch (error) {
      console.error('Error saving to storage:', error);
      // Fallback to localStorage for web
      localStorage.setItem(key, JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expires: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (7 * 24 * 60 * 60 * 1000)
      }));
    }
  };

  const getStorageItem = async (key) => {
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

  const removeStorageItem = async (key) => {
    try {
      await Preferences.remove({ key: key });
    } catch (error) {
      console.error('Error removing from storage:', error);
      // Fallback to localStorage for web
      localStorage.removeItem(key);
    }
  };

  const clearAllStorageItems = async () => {
    const keys = ['saved_email', 'saved_password', 'remember_me', 'token', 'user'];
    for (const key of keys) {
      await removeStorageItem(key);
    }
  };

  // Load saved credentials and check existing session
  useEffect(() => {
    const initializeAuth = async () => {
      setMounted(true);
      
      // Check for existing valid session
      const savedToken = await getStorageItem('token');
      const savedUser = await getStorageItem('user');
      
      if (savedToken && savedUser) {
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        
        // Verify token is still valid by making a test request
        try {
          const response = await axios.get(`${backend_url}/api/auth/verify-token`);
          if (response.data.success) {
            navigate('/chat');
            return;
          }
        } catch (error) {
          // Token is invalid, clear storage
          console.log('Token expired or invalid, clearing storage');
          await clearAllStorageItems();
        }
      }
      
      // Check for saved credentials
      const savedEmail = await getStorageItem('saved_email');
      const savedPassword = await getStorageItem('saved_password');
      const wasRemembered = await getStorageItem('remember_me');
      
      if (savedEmail && savedPassword && wasRemembered) {
        setFormData({
          email: savedEmail,
          password: savedPassword,
        });
        setRememberMe(true);
      }
    };

    initializeAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCredentials = async () => {
    if (rememberMe) {
      await setStorageItem('saved_email', formData.email);
      await setStorageItem('saved_password', formData.password);
      await setStorageItem('remember_me', true);
    } else {
      await removeStorageItem('saved_email');
      await removeStorageItem('saved_password');
      await removeStorageItem('remember_me');
    }
  };

  const clearSavedCredentials = async () => {
    await removeStorageItem('saved_email');
    await removeStorageItem('saved_password');
    await removeStorageItem('remember_me');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${backend_url}/api/auth/login`, {
        ...formData,
        rememberMe,
      });

      if (response.data.success) {
        // Save credentials if remember me is checked
        await saveCredentials();

        // Save token and user data
        await setStorageItem('token', response.data.token);
        if (response.data.user) {
          await setStorageItem('user', response.data.user);
        }

        // Set default axios header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        toast.success("Welcome back! Login successful! 🎉");
        navigate("/chat");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        const message = error.response.data.message.toLowerCase();

        if (message === "email not found") {
          setErrors({ email: "Email not found" });
          toast.error("Email not found");
          await clearSavedCredentials();
        } else if (message === "incorrect password") {
          setErrors({ password: "Incorrect password" });
          toast.error("Incorrect password");
          await clearSavedCredentials();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = async (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    
    // If unchecking remember me, clear saved credentials immediately
    if (!checked) {
      await clearSavedCredentials();
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await swal.fire({
      title: 'Reset Your Password',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputPlaceholder: 'you@example.com',
      inputValue: formData.email,
      confirmButtonText: 'Send OTP',
      showCancelButton: true,
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    });

    if (!email || !email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email format");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${backend_url}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("If an account with that email exists, an OTP has been sent to your email 📧");
        navigate('/reset-password');
      } else {
        toast.error(data.message || "Error sending OTP");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-shape shape-1"></div>
        <div className="login-background-shape shape-2"></div>
        <div className="login-background-shape shape-3"></div>
      </div>
      
      <div className={`login-card ${mounted ? 'mounted' : ''}`}>
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">🚀</div>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="error-message general-error">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="error-text">
                <span className="error-icon">❌</span>
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">
                <span className="error-icon">❌</span>
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-options">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="checkbox-label">
                <span className="checkmark"></span>
                Remember me for 30 days
              </label>
            </div>

            <button
              type="button"
              className="forgot-password-btn"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                <span className="btn-icon">🔐</span>
                Sign In
              </>
            )}
          </button>

        </form>

        <div className="login-footer">
          <p>
            Don't have an account?
            <Link to="/signup" className="signup-link">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;