import React, { useState, useEffect,useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./signup.css";
import { backend_url } from "./utils/backend";
import { StorageService } from "./utils/storage";
import Swal from "sweetalert2"; 
import {UserContext} from "./UserContext.jsx";
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
  const [isDemoAccount, setIsDemoAccount] = useState(false);
  const { setUser } = useContext(UserContext);
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

  // Handle demo account signup (bypass OTP)
  const handleDemoSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newUser = {
      name: "Spiritual Seeker",
      email: "demo@geetagpt.com",
      isDemo: true,
      avatar: "🕉️"
    };
      const { confirmPassword, ...submitData } = formData;

      const response = await axios.post(
        `${backend_url}/api/auth/signup`,
        {
          ...submitData,
          skipOTP: true // Flag to bypass OTP verification
        }
      );
      
      if (response.data.success) {
        console.log("Demo signup response:", response.data);
        
        // Set token using StorageService (works for both web and Capacitor)
        if (response.data.token) {
          await StorageService.set("token", response.data.token, {
            expires: 1/24, // 1 hour for demo accounts
            sameSite: "strict"
          });

          axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
          console.log("Token set successfully");
        }
        
        // Store user data in localStorage (works for both platforms)
        if (response.data.user) {
  localStorage.setItem("user", JSON.stringify(response.data.user));
  setUser(response.data.user);
}

        
        // Show success message
        toast.success("Demo account created successfully! Welcome aboard! 🎉");
        // Navigate to chat
        setTimeout(() => {
          console.log("Navigating to /chat");
          navigate("/chat", { replace: true });
        }, 1000);
        
      } else {
        console.error("Signup failed:", response.data);
        toast.error(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Demo signup error:", error);
      
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

  const handleOTPSignup = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    // Send OTP
    const sendRes = await axios.post(`${backend_url}/api/auth/send-otp`, {
      email: formData.email.toLowerCase()
    });

    const sendData = sendRes.data;

    // Ask user to input OTP
    const { value: otp } = await Swal.fire({
      title: 'Enter OTP',
      input: 'text',
      inputLabel: 'Check your email for the 6-digit OTP',
      inputPlaceholder: 'Enter OTP here',
      inputAttributes: {
        maxlength: 6,
        autocapitalize: 'off',
        autocorrect: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Verify & Create Account',
      cancelButtonText: 'Cancel',
      footer: '<span style="color: gray;">Didn\'t see the email? Check your <b>Spam</b> or <b>Promotions</b> folder.</span>'
    });

    if (!otp) {
      setLoading(false);
      return;
    }

    // Final Signup
    const signupRes = await axios.post(`${backend_url}/api/auth/signup`, {
      name: formData.name,
      email: formData.email.toLowerCase(),
      password: formData.password,
      otp
    });

    const signupData = signupRes.data;

    if (signupData.token) {
      await StorageService.set("token", signupData.token, {
        expires: 7,
        sameSite: "strict"
      });

      axios.defaults.headers.common["Authorization"] = `Bearer ${signupData.token}`;
    }

    if (signupData.user) {
  localStorage.setItem("user", JSON.stringify(signupData.user));
  setUser(signupData.user);
}

toast.success("Signup successful! Welcome aboard! 🎉");
navigate("/chat");
setUser(signupData.user);


  } catch (err) {
    console.error("Signup error:", err);
    if (err.response && err.response.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDemoAccount) {
      await handleDemoSignup();
    } else {
      await handleOTPSignup();
    }
  };

  const handleDemoFill = () => {
    const { name, email, password, confirmPassword } = generateRandomCredentials();
    setFormData({
      name: name,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    });
    setIsDemoAccount(true); 
    setErrors({});
    toast.info("Demo credentials generated! Click 'Create Account' to proceed without OTP.");
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
          {isDemoAccount && (
            <div className="demo-indicator">
              <span className="demo-badge">🎭 Demo Account Mode</span>
              <p className="demo-text">No OTP verification required</p>
            </div>
          )}
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

          <button 
            type="submit" 
            className="signup-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {isDemoAccount ? 'Creating Demo Account...' : 'Creating Account...'}
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                {isDemoAccount ? 'Create Demo Account' : 'Create Account'}
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

          {isDemoAccount && (
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
                setIsDemoAccount(false);
                setErrors({});
                toast.info("Switched back to regular signup mode");
              }}
              disabled={loading}
            >
              <span className="btn-icon">🔄</span>
              Switch to Regular Signup
            </button>
          )}
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
          <br />
          <p>
            Want to know more about us?
            <Link to="/landing" className="login-link">
             Click here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;