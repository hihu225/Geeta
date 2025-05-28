import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDemoPopup, setShowDemoPopup] = useState(false);

  // Enhanced styles
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },

    header: {
      maxWidth: "800px",
      margin: "50px auto 40px auto",
      textAlign: "center",
    },

    backButton: {
      position: "absolute",
      top: "18px",
      left: "15px",
      backgroundColor: "#f3f4f6",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    title: {
      fontSize: "32px",
      fontWeight: "800",
      color: "#1f2937",
      marginBottom: "8px",
      letterSpacing: "-0.5px",
    },

    subtitle: {
      fontSize: "16px",
      color: "#6b7280",
      fontWeight: "400",
    },

    mainContent: {
      maxWidth: "600px",
      margin: "0 auto",
    },

    userCard: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "32px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e5e7eb",
    },

    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "16px",
    },

    avatar: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "700",
      color: "white",
    },

    userDetails: {
      flex: 1,
    },

    userName: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "4px",
    },

    userEmail: {
      fontSize: "14px",
      color: "#6b7280",
    },

    demoTag: {
      display: "inline-block",
      backgroundColor: "#fef3c7",
      color: "#92400e",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
      marginTop: "8px",
    },

    actionsCard: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e5e7eb",
    },

    sectionTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "16px",
    },

    buttonGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },

    actionButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "15px",
      fontWeight: "500",
      textAlign: "left",
    },

    logoutButton: {
      borderColor: "#d1d5db",
      color: "#374151",
    },

    deleteButton: {
      borderColor: "#fecaca",
      backgroundColor: "#fef2f2",
      color: "#dc2626",
    },

    buttonIcon: {
      fontSize: "18px",
      marginRight: "12px",
    },

    buttonText: {
      flex: 1,
    },

    buttonSubtext: {
      fontSize: "13px",
      color: "#6b7280",
      marginTop: "2px",
    },

    chevron: {
      fontSize: "16px",
      color: "#9ca3af",
    },

    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
    },

    loadingSpinner: {
      width: "40px",
      height: "40px",
      border: "3px solid #e5e7eb",
      borderTop: "3px solid #3b82f6",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },

    // Popup styles
    popupOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px",
    },

    popupContainer: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "32px",
      maxWidth: "420px",
      width: "100%",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      border: "1px solid #e5e7eb",
      textAlign: "center",
    },

    popupIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },

    popupTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "12px",
    },

    popupMessage: {
      fontSize: "15px",
      color: "#6b7280",
      lineHeight: "1.5",
      marginBottom: "24px",
    },

    popupButtons: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
    },

    popupButton: {
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "1px solid",
    },

    popupButtonPrimary: {
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
      color: "white",
    },

    popupButtonSecondary: {
      backgroundColor: "#ffffff",
      borderColor: "#d1d5db",
      color: "#374151",
    },
  };

  // Add CSS animations
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .back-btn:hover {
        background-color: #e5e7eb !important;
        border-color: #9ca3af !important;
        transform: translateY(-1px) !important;
      }

      .logout-btn:hover {
        background-color: #f9fafb !important;
        border-color: #9ca3af !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      }

      .delete-btn:hover {
        background-color: #fee2e2 !important;
        border-color: #fca5a5 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15) !important;
      }

      .action-btn:active {
        transform: translateY(0) !important;
      }

      .popup-btn-primary:hover {
        background-color: #2563eb !important;
        border-color: #2563eb !important;
      }

      .popup-btn-secondary:hover {
        background-color: #f9fafb !important;
        border-color: #9ca3af !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Get user info from localStorage or make API call
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Fallback if nothing is stored
          setUser({
            name: "User",
            email: "user@example.com",
            isDemo: false
          });
        }
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
        setUser({
          name: "User",
          email: "user@example.com",
          isDemo: false
        });
      }
    };

    getUserInfo();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const handleDeleteAccount = () => {
    // Check if user email ends with @example.com (demo account)
    if (user && user.email.endsWith('@example.com')) {
      setShowDemoPopup(true);
    } else {
      navigate('/delete-account');
    }
  };

  const handleDemoPopupLogout = () => {
    setShowDemoPopup(false);
    handleLogout();
  };

  const handleDemoPopupClose = () => {
    setShowDemoPopup(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button
        onClick={handleBack}
        style={styles.backButton}
        className="back-btn"
      >
        <span>←</span>
        Back
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Account Settings</h1>
        <p style={styles.subtitle}>Manage your account preferences and security</p>
      </div>

      <div style={styles.mainContent}>
        {/* User Info Card */}
        <div style={styles.userCard}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {getInitials(user.name)}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userEmail}>{user.email}</div>
              {user.isDemo && (
                <div style={styles.demoTag}>Demo Account</div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div style={styles.actionsCard}>
          <h2 style={styles.sectionTitle}>Account Actions</h2>
          
          <div style={styles.buttonGroup}>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                ...styles.actionButton,
                ...styles.logoutButton,
              }}
              className="logout-btn action-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={styles.buttonIcon}>🚪</span>
                <div style={styles.buttonText}>
                  <div>Logout</div>
                  <div style={styles.buttonSubtext}>Sign out of your account</div>
                </div>
              </div>
              <span style={styles.chevron}>›</span>
            </button>

            {/* Delete Account Button */}
            <button
              onClick={handleDeleteAccount}
              style={{
                ...styles.actionButton,
                ...styles.deleteButton,
              }}
              className="delete-btn action-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={styles.buttonIcon}>⚠️</span>
                <div style={styles.buttonText}>
                  <div>Delete Account</div>
                  <div style={styles.buttonSubtext}>Permanently remove your account and all data</div>
                </div>
              </div>
              <span style={styles.chevron}>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Account Popup */}
      {showDemoPopup && (
        <div style={styles.popupOverlay} onClick={handleDemoPopupClose}>
          <div style={styles.popupContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupIcon}>ℹ️</div>
            <h3 style={styles.popupTitle}>Demo Account</h3>
            <p style={styles.popupMessage}>
              No need to delete your demo account. It will be automatically deleted in 1 hour. 
              You can logout instead.
            </p>
            <div style={styles.popupButtons}>
              <button
                onClick={handleDemoPopupLogout}
                style={{
                  ...styles.popupButton,
                  ...styles.popupButtonPrimary,
                }}
                className="popup-btn-primary"
              >
                Logout
              </button>
              <button
                onClick={handleDemoPopupClose}
                style={{
                  ...styles.popupButton,
                  ...styles.popupButtonSecondary,
                }}
                className="popup-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;