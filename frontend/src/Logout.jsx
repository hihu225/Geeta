import { useState, useEffect,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StorageService } from "./utils/storage";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url} from "./utils/backend";
import { ThemeContext } from "./ThemeContext";
import { clearFCMTokenForUserChange } from './FCMToken';
const Logout = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const { theme } = useContext(ThemeContext);
  // Enhanced styles
  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "100vw",
      backgroundColor: "rgba(10, 7, 21, 0.72)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      animation: "fadeIn 0.2s ease-out",
    },

    title: {
      fontSize: "28px",
      fontWeight: "600",
      marginBottom: "10px",
      letterSpacing: "var(--tracking-tight)",
      fontFamily: "var(--font-display)",
      color: "var(--gold-bright)",
    },

    message: {
      fontSize: "15px",
      color: "var(--text-secondary)",
      marginBottom: "28px",
      lineHeight: "1.6",
      fontWeight: "400",
      fontFamily: "var(--font-body)",
    },

    buttonRow: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginTop: "24px",
    },

    confirmBtn: {
      backgroundColor: "var(--error)",
      color: "#FBF1DE",
      border: "1px solid var(--error)",
      padding: "13px 26px",
      borderRadius: "var(--r-full)",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      minWidth: "130px",
      letterSpacing: "var(--tracking-wide)",
      fontFamily: "var(--font-body)",
      transition: "all var(--dur-fast) var(--ease-out)",
      boxShadow: "var(--shadow-md)",
      position: "relative",
      overflow: "hidden",
    },

    cancelBtn: {
      backgroundColor: "transparent",
      color: "var(--text-body)",
      border: "1px solid var(--border-soft)",
      padding: "13px 26px",
      borderRadius: "var(--r-full)",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      minWidth: "130px",
      letterSpacing: "var(--tracking-wide)",
      fontFamily: "var(--font-body)",
      transition: "all var(--dur-fast) var(--ease-out)",
      position: "relative",
      overflow: "hidden",
    }
  };

  // Add CSS animations to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    .modal {
      padding: 36px 32px;
      border-radius: var(--r-2xl);
      width: 400px;
      max-width: 90vw;
      text-align: center;
      position: relative;
      animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: all var(--dur-med) var(--ease-out);
      font-family: var(--font-body);
      background: var(--grad-glass);
      backdrop-filter: blur(28px) saturate(140%);
      -webkit-backdrop-filter: blur(28px) saturate(140%);
      border: 1px solid var(--border-soft);
      color: var(--text-body);
      box-shadow: var(--shadow-lg), var(--glow-gold), inset 0 1px 0 rgba(255,255,255,0.05);
    }

    .modal.light,
    .modal.dark {
      background: var(--grad-glass);
      color: var(--text-body);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-lg), var(--glow-gold), inset 0 1px 0 rgba(255,255,255,0.05);
    }

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

      .confirm-btn:hover {
        filter: brightness(1.08) !important;
        transform: translateY(-1px) !important;
        box-shadow: var(--shadow-lg), 0 0 30px rgba(239, 108, 108, 0.35) !important;
      }

      .cancel-btn:hover {
        color: var(--gold-bright) !important;
        border-color: var(--border-strong) !important;
        background: rgba(245, 200, 120, 0.06) !important;
        transform: translateY(-1px) !important;
      }

      .confirm-btn:active,
      .cancel-btn:active {
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

const handleLogout = async () => {
  try {
    await axios.post(`${backend_url}/api/auth/logout`, {}, {
      // headers: {
      //   "Content-Type": "application/json",
      //   "Authorization": `Bearer ${await StorageService.get("token")}`
      // }
    });

    // Clear FCM token cache for user change BEFORE clearing other data
    try {
      clearFCMTokenForUserChange();
      console.log('FCM token cache cleared for logout');
    } catch (fcmError) {
      console.warn('Error clearing FCM token cache during logout:', fcmError);
    }

    // Clear all stored data
    await StorageService.remove("token");
    await StorageService.remove("saved_email");
    await StorageService.remove("saved_password");
    await StorageService.remove("remember_me");

    // Clear localStorage data
    localStorage.removeItem("user");
    localStorage.setItem("loggedOut", "true");

    // Clear notification preferences
    localStorage.removeItem("notificationPreferences");

    // Clear axios authorization header
    delete axios.defaults.headers.common["Authorization"];

    toast.success("Logged out successfully! 👋");

    // Redirect to login page
    navigate("/login", { replace: true });

  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Error during logout, but you've been logged out locally.");

    // Still clear FCM token cache even if API call fails
    try {
      clearFCMTokenForUserChange();
    } catch (fcmError) {
      console.warn('Error clearing FCM token cache during logout cleanup:', fcmError);
    }

    // Still clear local data even if API call fails
    await StorageService.remove("token");
    await StorageService.remove("saved_email");
    await StorageService.remove("saved_password");
    await StorageService.remove("remember_me");
    localStorage.removeItem("user");
    localStorage.setItem("loggedOut", "true");
    localStorage.removeItem("notificationPreferences");
    delete axios.defaults.headers.common["Authorization"];

    // Still redirect even if there's an error
    navigate("/login", { replace: true });
  }
};

  const handleCancel = () => {
    navigate(-1);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {showModal && (
        <div style={styles.overlay} onClick={handleCancel}>
          <div className={`modal ${theme}`} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.title}>Confirm Logout</h3>
            <p style={styles.message}>
              Are you sure you want to log out of your account?
            </p>
            <div style={styles.buttonRow}>
              <button
                onClick={handleLogout}
                style={styles.confirmBtn}
                className="confirm-btn"
              >
                Yes, Logout
              </button>
              <button
                onClick={handleCancel}
                style={styles.cancelBtn}
                className="cancel-btn"
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

export default Logout;
