import { useState, useEffect,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StorageService } from "./utils/storage";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url} from "./utils/backend";
import { ThemeContext } from "./ThemeContext";
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
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      animation: "fadeIn 0.2s ease-out",
    },
    
    
    title: {
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "8px",
      letterSpacing: "-0.5px",
    },
    
    message: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "28px",
      lineHeight: "1.5",
      fontWeight: "400",
    },
    
    buttonRow: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginTop: "24px",
    },
    
    confirmBtn: {
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "600",
      minWidth: "120px",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
      position: "relative",
      overflow: "hidden",
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
    .modal {
  padding: 32px;
  border-radius: 18px;
  width: 380px;
  max-width: 90vw;
  text-align: center;
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.3s ease;
  font-family: 'Segoe UI', sans-serif;
}

/* Light Theme */
.modal.light {
  background: linear-gradient(135deg, #fffdf6, #fff7ed);
  color: #9a3412;
  border: 1px solid #fcd34d;
  box-shadow:
    0 15px 35px rgba(154, 52, 18, 0.1),
    0 8px 16px rgba(154, 52, 18, 0.05);
}

/* Dark Theme */
.modal.dark {
  background: rgba(44, 44, 44, 0.85);
  backdrop-filter: blur(12px);
  color: #fcd34d;
  border: 1px solid #facc15;
  box-shadow:
    0 20px 40px rgba(250, 204, 21, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.05);
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

      .confirm-btn:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3) !important;
      }

      .cancel-btn:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleLogout = async () => {
  try {
    // Call the logout API endpoint
    await axios.post(`${backend_url}/api/auth/logout`, {}, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await StorageService.get("token")}`
      }
    });
    
    // Clear all stored data
    await StorageService.remove("token");
    await StorageService.remove("saved_email");
    await StorageService.remove("saved_password");
    await StorageService.remove("remember_me");
    
    // Clear localStorage data
    localStorage.removeItem("user");
    localStorage.setItem("loggedOut", "true");
    
    // Clear axios authorization header
    delete axios.defaults.headers.common["Authorization"];
    
    // Show success message
    toast.success("Logged out successfully! 👋");
    
    // Redirect to login page
    navigate("/login", { replace: true });
    
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Error during logout, but you've been logged out locally.");
    
    // Still clear local data even if API call fails
    await StorageService.remove("token");
    await StorageService.remove("saved_email");
    await StorageService.remove("saved_password");
    await StorageService.remove("remember_me");
    localStorage.removeItem("user");
    localStorage.setItem("loggedOut", "true");
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