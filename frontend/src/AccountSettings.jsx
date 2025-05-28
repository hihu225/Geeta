import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
      margin: "0 auto 40px auto",
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
    navigate('/delete-account');
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
    </div>
  );
};

export default AccountSettings;