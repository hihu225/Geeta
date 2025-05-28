import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";

const Logout = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

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
      width: "380px",
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
      color: "#1a1a1a",
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

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.setItem("loggedOut", "true"); 
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully! 👋");
    navigate("/login", { replace: true });
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
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
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