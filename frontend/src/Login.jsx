import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "./login.css";
import { backend_url } from "./utils/backend";
import swal from "sweetalert2";

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

  // Load saved credentials from cookies on component mount
  useEffect(() => {
    setMounted(true);
    
    // Check for saved credentials
    const savedEmail = Cookies.get('saved_email');
    const savedPassword = Cookies.get('saved_password');
    const wasRemembered = Cookies.get('remember_me') === 'true';
    
    if (savedEmail && savedPassword && wasRemembered) {
      setFormData({
        email: savedEmail,
        password: savedPassword,
      });
      setRememberMe(true);
    }
  }, []);

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

  const saveCredentials = () => {
    if (rememberMe) {
      // Save credentials for 30 days
      Cookies.set('saved_email', formData.email, { 
        expires: 30, 
        sameSite: 'strict',
        secure: true // Use secure flag for production HTTPS
      });
      Cookies.set('saved_password', formData.password, { 
        expires: 30, 
        sameSite: 'strict',
        secure: true // Use secure flag for production HTTPS
      });
      Cookies.set('remember_me', 'true', { 
        expires: 30, 
        sameSite: 'strict',
        secure: true // Use secure flag for production HTTPS
      });
    } else {
      // Clear saved credentials if remember me is unchecked
      Cookies.remove('saved_email');
      Cookies.remove('saved_password');
      Cookies.remove('remember_me');
    }
  };

  const clearSavedCredentials = () => {
    Cookies.remove('saved_email');
    Cookies.remove('saved_password');
    Cookies.remove('remember_me');
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
        saveCredentials();

        Cookies.set("token", response.data.token, {
          expires: rememberMe ? 30 : 7,
          sameSite: "strict",
        });

        // Set default axios header for future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
        
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        
        toast.success("Welcome back! Login successful! 🎉");
        localStorage.removeItem("loggedOut");
        navigate("/chat");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        const message = error.response.data.message.toLowerCase();

        if (message === "email not found") {
          setErrors({ email: "Email not found" });
          toast.error("Email not found");
          // Clear saved credentials if email is not found
          clearSavedCredentials();
        } else if (message === "incorrect password") {
          setErrors({ password: "Incorrect password" });
          toast.error("Incorrect password");
          // Clear saved credentials if password is incorrect
          clearSavedCredentials();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    
    // If unchecking remember me, clear saved credentials immediately
    if (!checked) {
      clearSavedCredentials();
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await swal.fire({
      title: 'Reset Your Password',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputPlaceholder: 'you@example.com',
      inputValue: formData.email, // Pre-fill with current email if available
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

    // Basic email format validation
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
        navigate('/reset-password'); // Optional: only if needed now
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