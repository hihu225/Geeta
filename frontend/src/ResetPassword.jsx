import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { backend_url } from './utils/backend';
import './login.css'; // Reusing the same CSS file

const ResetPassword = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation trigger
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (field, value) => {
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'otp':
        setOtp(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!otp) {
      newErrors.otp = "OTP is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validateForm()) {
      toast.error("Please fill all fields correctly");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      toast.error("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${backend_url}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful! Please login. 🎉");
        navigate('/login');
      } else {
        toast.error(data.message || 'Error resetting password');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
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
            <div className="logo-icon">🔐</div>
          </div>
          <h2>Reset Password</h2>
          <p>Enter your details to reset your password</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => handleChange('email', e.target.value)}
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
  <label htmlFor="otp">OTP Code</label>
  <div className="input-wrapper">
    <input
      type="text"
      id="otp"
      value={otp}
      onChange={e => handleChange('otp', e.target.value)}
      className={errors.otp ? "error" : ""}
      placeholder="Enter OTP from your email"
      disabled={loading}
      maxLength="6"
    />
  </div>

  {errors.otp && (
    <span className="error-text">
      <span className="error-icon">❌</span>
      {errors.otp}
    </span>
  )}

  {!errors.otp && (
    <span className="info-text" style={{ color: 'gray', fontSize: '0.85rem' }}>
      📩 Didn't get the OTP? Check your <b>Spam</b> or <b>Promotions</b> folder.
    </span>
  )}
</div>


          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={e => handleChange('newPassword', e.target.value)}
                className={errors.newPassword ? "error" : ""}
                placeholder="Enter new password"
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
            {errors.newPassword && (
              <span className="error-text">
                <span className="error-icon">❌</span>
                {errors.newPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? "error" : ""}
                placeholder="Confirm new password"
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
            onClick={handleReset} 
            disabled={loading}
            className="login-btn"
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="btn-icon">🔐</span>
                Reset Password
              </>
            )}
          </button>
        </div>

        <div className="login-footer">
          <p>
            Remember your password?
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="signup-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;