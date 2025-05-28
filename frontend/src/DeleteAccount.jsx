import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "./utils/backend";
import { StorageService } from "./utils/storage";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [deleteMethod, setDeleteMethod] = useState("password"); // "password" or "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Enhanced styles
  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "100vw",
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      animation: "fadeIn 0.2s ease-out",
    },
    
    modal: {
      background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      padding: "32px",
      borderRadius: "16px",
      width: "450px",
      maxWidth: "90vw",
      boxShadow: `
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 8px 16px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.05)
      `,
      textAlign: "center",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      position: "relative",
      animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    
    title: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#dc2626",
      marginBottom: "8px",
      letterSpacing: "-0.5px",
    },
    
    message: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "20px",
      lineHeight: "1.5",
      fontWeight: "400",
    },

    warning: {
      backgroundColor: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "20px",
      fontSize: "14px",
      color: "#dc2626",
      fontWeight: "500",
    },

    methodSelector: {
      display: "flex",
      backgroundColor: "#f3f4f6",
      borderRadius: "8px",
      padding: "4px",
      marginBottom: "20px",
      gap: "4px",
    },

    methodButton: {
      flex: 1,
      padding: "8px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
    },

    methodButtonActive: {
      backgroundColor: "#ffffff",
      color: "#dc2626",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },

    methodButtonInactive: {
      backgroundColor: "transparent",
      color: "#6b7280",
    },

    inputGroup: {
      marginBottom: "24px",
      textAlign: "left",
    },

    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "8px",
    },

    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "all 0.2s ease",
      backgroundColor: "#ffffff",
      boxSizing: "border-box",
    },

    otpInput: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "18px",
      textAlign: "center",
      letterSpacing: "4px",
      fontWeight: "600",
      transition: "all 0.2s ease",
      backgroundColor: "#ffffff",
      boxSizing: "border-box",
    },

    inputFocus: {
      outline: "none",
      borderColor: "#dc2626",
      boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)",
    },

    otpSection: {
      textAlign: "center",
      marginBottom: "20px",
    },

    sendOtpBtn: {
      backgroundColor: "#059669",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: isSendingOtp ? "not-allowed" : "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.2s ease",
      opacity: isSendingOtp ? 0.7 : 1,
      marginTop: "8px",
    },

    timerText: {
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "8px",
    },

    forgotPasswordLink: {
      color: "#059669",
      fontSize: "12px",
      cursor: "pointer",
      textDecoration: "underline",
      marginTop: "8px",
      display: "block",
    },
    
    buttonRow: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginTop: "24px",
    },
    
    deleteBtn: {
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: isDeleting ? "not-allowed" : "pointer",
      fontSize: "15px",
      fontWeight: "600",
      minWidth: "140px",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
      position: "relative",
      overflow: "hidden",
      opacity: isDeleting ? 0.7 : 1,
    },
    
    cancelBtn: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
      border: "1px solid #d1d5db",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "600",
      minWidth: "120px",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
    }
  };

  // Add CSS animations to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .delete-btn:hover:not(:disabled) {
        background-color: #b91c1c !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4) !important;
      }

      .cancel-btn:hover {
        background-color: #e5e7eb !important;
        border-color: #9ca3af !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      }

      .send-otp-btn:hover:not(:disabled) {
        background-color: #047857 !important;
        transform: translateY(-1px) !important;
      }

      .delete-btn:active:not(:disabled) {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3) !important;
      }

      .cancel-btn:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      }

      .password-input:focus, .otp-input:focus {
        outline: none !important;
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const token = await StorageService.get("token");

      await axios.post(`${backend_url}/api/auth/send-delete-otp`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOtpSent(true);
      setOtpTimer(900); // 15 minutes
      toast.success("OTP sent to your email successfully");
      
    } catch (error) {
      console.error("Send OTP error:", error);
      const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteMethod === "password") {
      if (!password.trim()) {
        toast.error("Please enter your password to confirm account deletion");
        return;
      }
    } else {
      if (!otp.trim()) {
        toast.error("Please enter the OTP sent to your email");
        return;
      }
    }

    setIsDeleting(true);

    try {
      const token = await StorageService.get("token");
      let endpoint, payload;

      if (deleteMethod === "password") {
        endpoint = `${backend_url}/api/auth/delete-account`;
        payload = { password: password };
      } else {
        endpoint = `${backend_url}/api/auth/verify-delete-otp`;
        payload = { otp: otp };
      }
      
      await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Clear all user data
await StorageService.remove("token");
await StorageService.remove("saved_email");
await StorageService.remove("saved_password");
await StorageService.remove("remember_me");
localStorage.clear();
      delete axios.defaults.headers.common["Authorization"];
      
      toast.success("Account deleted successfully");
      navigate("/login", { replace: true });
      
    } catch (error) {
      console.error("Delete account error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = async () => {
    // If OTP was sent, cancel the delete request
    if (otpSent) {
      try {
        const token = await StorageService.get("token");
        await axios.post(`${backend_url}/api/auth/cancel-delete-request`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Cancel delete request error:", error);
      }
    }
    navigate(-1);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDeleting]);

  // Handle Enter key for form submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isDeleting) {
      if (deleteMethod === "otp" && !otpSent) {
        handleSendOtp();
      } else {
        handleDeleteAccount();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {showModal && (
        <div style={styles.overlay} onClick={!isDeleting ? handleCancel : undefined}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.title}>⚠️ Delete Account</h3>
            <p style={styles.message}>
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </p>
            
            <div style={styles.warning}>
              <strong>Warning:</strong> All your chats, settings, and account information will be permanently removed.
            </div>

            {/* Method Selector */}
            <div style={styles.methodSelector}>
              <button
                style={{
                  ...styles.methodButton,
                  ...(deleteMethod === "password" ? styles.methodButtonActive : styles.methodButtonInactive)
                }}
                onClick={() => {
                  setDeleteMethod("password");
                  setOtpSent(false);
                  setOtpTimer(0);
                }}
                disabled={isDeleting || isSendingOtp}
              >
                Use Password
              </button>
              <button
                style={{
                  ...styles.methodButton,
                  ...(deleteMethod === "otp" ? styles.methodButtonActive : styles.methodButtonInactive)
                }}
                onClick={() => {
                  setDeleteMethod("otp");
                  setPassword("");
                }}
                disabled={isDeleting || isSendingOtp}
              >
                Use OTP
              </button>
            </div>

            {/* Password Method */}
            {deleteMethod === "password" && (
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="password">
                  Enter your password to confirm:
                </label>
                <input
  id="password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Enter your password"
  style={{ ...styles.input, color: "black" }}
  className="password-input"
  disabled={isDeleting}
  autoFocus
/>

                <span 
                  style={styles.forgotPasswordLink}
                  onClick={() => setDeleteMethod("otp")}
                >
                  Forgot password? Use OTP instead
                </span>
              </div>
            )}

            {/* OTP Method */}
            {deleteMethod === "otp" && (
              <div style={styles.inputGroup}>
                {!otpSent ? (
                  <div style={styles.otpSection}>
                    <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>
                      Click below to receive an OTP on your registered email
                    </p>
                    <button
                      onClick={handleSendOtp}
                      style={styles.sendOtpBtn}
                      className="send-otp-btn"
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <>
                    <label style={styles.label} htmlFor="otp">
                      Enter OTP sent to your email:
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyPress={handleKeyPress}
                      placeholder="000000"
                      style={{ ...styles.input, color: "black" }}
                      className="otp-input"
                      disabled={isDeleting}
                      autoFocus
                      maxLength={6}
                    />
                    {otpTimer > 0 && (
                      <div style={styles.timerText}>
                        OTP expires in: {formatTime(otpTimer)}
                      </div>
                    )}
                    {otpTimer === 0 && (
                      <button
                        onClick={handleSendOtp}
                        style={{...styles.sendOtpBtn, fontSize: "12px", padding: "6px 12px"}}
                        className="send-otp-btn"
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? "Sending..." : "Resend OTP"}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            <div style={styles.buttonRow}>
              <button
                onClick={handleDeleteAccount}
                style={styles.deleteBtn}
                className="delete-btn"
                disabled={isDeleting || (deleteMethod === "otp" && !otpSent)}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
              <button
                onClick={handleCancel}
                style={styles.cancelBtn}
                className="cancel-btn"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccount;