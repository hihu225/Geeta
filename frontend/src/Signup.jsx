import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "./signup.css";
import { backend_url } from "./utils/backend";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  // Animation trigger
  useEffect(() => {
    setMounted(true);
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;

      const response = await axios.post(
        `${backend_url}/api/auth/signup`,
        submitData
      );

      if (response.data.success) {
        if (response.data.token) {
          // Store token in cookie (session cookie)
          Cookies.set("token", response.data.token, {
            sameSite: "strict",
            expires: 7,
          });
          // Set axios default headers for future requests
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;
        }

        toast.success("Account created successfully! Welcome aboard! 🎉");
        navigate("/chat");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("email")) {
          setErrors({ email: "Email already exists" });
          toast.error("Email already exists");
        } else {
          setErrors({ general: error.response.data.message });
          toast.error(error.response.data.message);
        }
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
const generateRandomCredentials = () => {
  
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Parker', 'Sage'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
  const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  
  
  const randomNumber = Math.floor(Math.random() * 100000);
  const timestamp = Date.now().toString().slice(-6);
  const demoEmail = `demo_${randomNumber}_${timestamp}@example.com`;
  
 
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPassword = 'demo_';
  for (let i = 0; i < 8; i++) {
    randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return { 
    name: randomName,
    email: demoEmail, 
    password: randomPassword,
    confirmPassword: randomPassword
  };
};

const handleDemoFill = () => {
  const { name, email, password, confirmPassword } = generateRandomCredentials();
  setFormData({
    name: name,
    email: email,
    password: password,
    confirmPassword: confirmPassword,
  });
  // Clear any existing errors
  setErrors({});
  toast.info("Unique demo credentials generated! Ready to sign up.");
};
  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="signup-background-shape shape-1"></div>
        <div className="signup-background-shape shape-2"></div>
        <div className="signup-background-shape shape-3"></div>
      </div>
      
      <div className={`signup-card ${mounted ? 'mounted' : ''}`}>
        <div className="signup-header">
          <div className="signup-logo">
            <div className="logo-icon">✨</div>
          </div>
          <h2>Create Account</h2>
          <p>Join us today and start your journey!</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {errors.general && (
            <div className="error-message general-error">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter your full name"
                disabled={loading}
                autoComplete="name"
              />
            </div>
            {errors.name && (
              <span className="error-text">
                <span className="error-icon">❌</span>
                {errors.name}
              </span>
            )}
          </div>

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
                placeholder="Create a strong password"
                disabled={loading}
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                placeholder="Confirm your password"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">
                <span className="error-icon">❌</span>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                Create Account
              </>
            )}
          </button>

          <button
            type="button"
            className="demo-btn"
            onClick={handleDemoFill}
            disabled={loading}
          >
            <span className="btn-icon">🎭</span>
            Fill Demo Data
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;