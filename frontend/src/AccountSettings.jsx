import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🕉️');

  // Avatar options inspired by Bhagavad Gita and Hindu philosophy
  const avatarOptions = [
    { icon: '🕉️', name: 'Om' },
    { icon: '🪷', name: 'Lotus' },
    { icon: '🔱', name: 'Trishul' },
    { icon: '📿', name: 'Mala' },
    { icon: '🐚', name: 'Conch' },
    { icon: '🌸', name: 'Flower' },
    { icon: '🌟', name: 'Star' },
    { icon: '🔥', name: 'Sacred Fire' },
    { icon: '🌙', name: 'Moon' },
    { icon: '☀️', name: 'Sun' },
    { icon: '🦚', name: 'Peacock' },
    { icon: '🎋', name: 'Bamboo' }
  ];

  // Enhanced styles with Bhagavad Gita theme
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fef7ed 0%, #fff7ed 100%)",
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
      backgroundColor: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      color: "#9a3412",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    title: {
      fontSize: "32px",
      fontWeight: "800",
      color: "#9a3412",
      marginBottom: "8px",
      letterSpacing: "-0.5px",
    },

    subtitle: {
      fontSize: "16px",
      color: "#c2410c",
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
      boxShadow: "0 4px 12px rgba(154, 52, 18, 0.08)",
      border: "1px solid #fed7aa",
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
      backgroundColor: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "2px solid #fed7aa",
      position: "relative",
      boxShadow: "0 4px 12px rgba(154, 52, 18, 0.12)",
    },

    avatarEdit: {
      position: "absolute",
      bottom: "-2px",
      right: "-2px",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#f97316",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      color: "white",
      border: "2px solid white",
    },

    userDetails: {
      flex: 1,
    },

    userName: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#9a3412",
      marginBottom: "4px",
    },

    userEmail: {
      fontSize: "14px",
      color: "#c2410c",
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
      boxShadow: "0 4px 12px rgba(154, 52, 18, 0.08)",
      border: "1px solid #fed7aa",
    },

    sectionTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#9a3412",
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
      border: "1px solid #fed7aa",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "15px",
      fontWeight: "500",
      textAlign: "left",
    },

    logoutButton: {
      borderColor: "#fed7aa",
      color: "#9a3412",
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
      color: "#c2410c",
      marginTop: "2px",
    },

    chevron: {
      fontSize: "16px",
      color: "#fed7aa",
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
      border: "3px solid #fed7aa",
      borderTop: "3px solid #f97316",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },

    // Avatar selector styles
    avatarSelectorOverlay: {
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

    avatarSelectorContainer: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "32px",
      maxWidth: "480px",
      width: "100%",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      border: "1px solid #fed7aa",
    },

    avatarSelectorTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#9a3412",
      marginBottom: "24px",
      textAlign: "center",
    },

    avatarGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },

    avatarOption: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "2px solid transparent",
      backgroundColor: "#fff7ed",
    },

    avatarOptionSelected: {
      border: "2px solid #f97316",
      backgroundColor: "#fed7aa",
      transform: "scale(1.1)",
    },

    avatarButtons: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
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
      border: "1px solid #fed7aa",
      textAlign: "center",
    },

    popupIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },

    popupTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#9a3412",
      marginBottom: "12px",
    },

    popupMessage: {
      fontSize: "15px",
      color: "#c2410c",
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
      backgroundColor: "#f97316",
      borderColor: "#f97316",
      color: "white",
    },

    popupButtonSecondary: {
      backgroundColor: "#ffffff",
      borderColor: "#fed7aa",
      color: "#9a3412",
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
        background-color: #fed7aa !important;
        border-color: #fb923c !important;
        transform: translateY(-1px) !important;
      }

      .logout-btn:hover {
        background-color: #fff7ed !important;
        border-color: #fb923c !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(154, 52, 18, 0.15) !important;
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

      .avatar-hover:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 8px 16px rgba(154, 52, 18, 0.2) !important;
      }

      .avatar-option:hover {
        transform: scale(1.1) !important;
        background-color: #fed7aa !important;
      }

      .popup-btn-primary:hover {
        background-color: #ea580c !important;
        border-color: #ea580c !important;
      }

      .popup-btn-secondary:hover {
        background-color: #fff7ed !important;
        border-color: #fb923c !important;
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
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setSelectedAvatar(userData.avatar || '🕉️');
        } else {
          // Fallback if nothing is stored
          const defaultUser = {
            name: "Spiritual Seeker",
            email: "seeker@example.com",
            isDemo: false,
            avatar: '🕉️'
          };
          setUser(defaultUser);
          setSelectedAvatar('🕉️');
        }
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
        const defaultUser = {
          name: "Spiritual Seeker",
          email: "seeker@example.com",
          isDemo: false,
          avatar: '🕉️'
        };
        setUser(defaultUser);
        setSelectedAvatar('🕉️');
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

  const handleAvatarClick = () => {
    setShowAvatarSelector(true);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleAvatarSave = () => {
    // Update user with new avatar
    const updatedUser = { ...user, avatar: selectedAvatar };
    setUser(updatedUser);
    
    // Save to localStorage (in real app, this would be an API call)
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast?.("Avatar updated successfully!", { type: 'success' });
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
    
    setShowAvatarSelector(false);
  };

  const handleAvatarCancel = () => {
    setSelectedAvatar(user.avatar || '🕉️');
    setShowAvatarSelector(false);
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
        <h1 style={styles.title}>Profile Settings</h1>
        <p style={styles.subtitle}>Manage your spiritual journey preferences</p>
      </div>

      <div style={styles.mainContent}>
        {/* User Info Card */}
        <div style={styles.userCard}>
          <div style={styles.userInfo}>
            <div 
              style={styles.avatar}
              className="avatar-hover"
              onClick={handleAvatarClick}
              title="Click to change avatar"
            >
              {user.avatar || selectedAvatar}
              <div style={styles.avatarEdit}>✏️</div>
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userEmail}>{user.email}</div>
              {user.isDemo && (
                <div style={styles.demoTag}>Demo Seeker</div>
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
                  <div>End Session</div>
                  <div style={styles.buttonSubtext}>Sign out of your spiritual journey</div>
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
                  <div>Delete Profile</div>
                  <div style={styles.buttonSubtext}>Permanently remove your account and journey data</div>
                </div>
              </div>
              <span style={styles.chevron}>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div style={styles.avatarSelectorOverlay} onClick={handleAvatarCancel}>
          <div style={styles.avatarSelectorContainer} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.avatarSelectorTitle}>Choose Your Spiritual Avatar</h3>
            <div style={styles.avatarGrid}>
              {avatarOptions.map((option, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.avatarOption,
                    ...(selectedAvatar === option.icon ? styles.avatarOptionSelected : {})
                  }}
                  onClick={() => handleAvatarSelect(option.icon)}
                  title={option.name}
                >
                  {option.icon}
                </div>
              ))}
            </div>
            <div style={styles.avatarButtons}>
              <button
                onClick={handleAvatarSave}
                style={{
                  ...styles.popupButton,
                  ...styles.popupButtonPrimary,
                }}
                className="popup-btn-primary"
              >
                Save Avatar
              </button>
              <button
                onClick={handleAvatarCancel}
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

      {/* Demo Account Popup */}
      {showDemoPopup && (
        <div style={styles.popupOverlay} onClick={handleDemoPopupClose}>
          <div style={styles.popupContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupIcon}>🕉️</div>
            <h3 style={styles.popupTitle}>Demo Seeker Account</h3>
            <p style={styles.popupMessage}>
              Your demo spiritual journey will naturally conclude in 1 hour. 
              You may simply end your session instead of deletion.
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
                End Session
              </button>
              <button
                onClick={handleDemoPopupClose}
                style={{
                  ...styles.popupButton,
                  ...styles.popupButtonSecondary,
                }}
                className="popup-btn-secondary"
              >
                Continue Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;