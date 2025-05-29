import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🕉️');
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Enhanced styles with cleaner, more interactive design
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fefbf3 0%, #fff8f0 50%, #fef7ed 100%)",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif",
      position: "relative",
      overflow: "hidden",
    },

    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03,
      backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 2px, transparent 2px),
                       radial-gradient(circle at 75% 75%, #f97316 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
      animation: "float 20s ease-in-out infinite",
      zIndex: 0,
    },

    header: {
      maxWidth: "800px",
      margin: "60px auto 50px auto",
      textAlign: "center",
      position: "relative",
      zIndex: 1,
    },

    backButton: {
      position: "fixed",
      top: "20px",
      left: "20px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(254, 215, 170, 0.3)",
      borderRadius: "12px",
      padding: "12px 18px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      color: "#9a3412",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      zIndex: 1000,
      boxShadow: "0 4px 20px rgba(154, 52, 18, 0.1)",
    },

    title: {
      fontSize: "36px",
      fontWeight: "800",
      background: "linear-gradient(135deg, #9a3412 0%, #f97316 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      marginBottom: "12px",
      letterSpacing: "-1px",
      lineHeight: "1.2",
    },

    subtitle: {
      fontSize: "16px",
      color: "#c2410c",
      fontWeight: "400",
      opacity: 0.8,
    },

    mainContent: {
      maxWidth: "600px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },

    userCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      padding: "32px",
      marginBottom: "32px",
      boxShadow: "0 8px 32px rgba(154, 52, 18, 0.1)",
      border: "1px solid rgba(254, 215, 170, 0.3)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
    },

    userCardGlow: {
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background: "radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%)",
      animation: "pulse 4s ease-in-out infinite",
      pointerEvents: "none",
    },

    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginBottom: "16px",
      position: "relative",
      zIndex: 2,
    },

    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "36px",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "3px solid rgba(249, 115, 22, 0.2)",
      position: "relative",
      boxShadow: "0 8px 32px rgba(154, 52, 18, 0.15)",
    },

    avatarEdit: {
      position: "absolute",
      bottom: "0px",
      right: "0px",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      color: "white",
      border: "3px solid white",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
    },

    userDetails: {
      flex: 1,
    },

    userName: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#9a3412",
      marginBottom: "6px",
      letterSpacing: "-0.5px",
    },

    userEmail: {
      fontSize: "15px",
      color: "#c2410c",
      opacity: 0.8,
    },

    demoTag: {
      display: "inline-block",
      background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      color: "#92400e",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      marginTop: "12px",
      border: "1px solid rgba(146, 64, 14, 0.2)",
    },

    actionsCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 8px 32px rgba(154, 52, 18, 0.1)",
      border: "1px solid rgba(254, 215, 170, 0.3)",
      position: "relative",
      overflow: "hidden",
    },

    sectionTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#9a3412",
      marginBottom: "24px",
      letterSpacing: "-0.5px",
    },

    buttonGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },

    actionButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 24px",
      borderRadius: "16px",
      border: "1px solid transparent",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "16px",
      fontWeight: "600",
      textAlign: "left",
      position: "relative",
      overflow: "hidden",
    },

    logoutButton: {
      border: "1px solid rgba(254, 215, 170, 0.4)",
      color: "#9a3412",
    },

    deleteButton: {
      border: "1px solid rgba(254, 202, 202, 0.4)",
      backgroundColor: "rgba(254, 242, 242, 0.8)",
      color: "#dc2626",
    },

    buttonIcon: {
      fontSize: "20px",
      marginRight: "16px",
      transition: "transform 0.3s ease",
    },

    buttonText: {
      flex: 1,
    },

    buttonSubtext: {
      fontSize: "14px",
      opacity: 0.7,
      marginTop: "4px",
      fontWeight: "400",
    },

    chevron: {
      fontSize: "18px",
      opacity: 0.6,
      transition: "all 0.3s ease",
    },

    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
    },

    loadingSpinner: {
      width: "48px",
      height: "48px",
      border: "3px solid rgba(254, 215, 170, 0.3)",
      borderTop: "3px solid #f97316",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },

    // Modal styles
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(8px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      padding: "20px",
      animation: "fadeIn 0.3s ease-out",
    },

    modalContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      padding: "40px",
      maxWidth: "520px",
      width: "100%",
      boxShadow: "0 24px 48px rgba(0, 0, 0, 0.2)",
      border: "1px solid rgba(254, 215, 170, 0.3)",
      animation: "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
    },

    modalTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#9a3412",
      marginBottom: "28px",
      textAlign: "center",
      letterSpacing: "-0.5px",
    },

    avatarGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "32px",
    },

    avatarOption: {
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "2px solid transparent",
      backgroundColor: "rgba(255, 247, 237, 0.8)",
      position: "relative",
    },

    avatarOptionSelected: {
      border: "2px solid #f97316",
      backgroundColor: "#fed7aa",
      transform: "scale(1.1)",
      boxShadow: "0 8px 24px rgba(249, 115, 22, 0.3)",
    },

    modalButtons: {
      display: "flex",
      gap: "16px",
      justifyContent: "center",
    },

    modalButton: {
      padding: "14px 28px",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "1px solid",
      minWidth: "120px",
    },

    modalButtonPrimary: {
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      borderColor: "#f97316",
      color: "white",
      boxShadow: "0 4px 16px rgba(249, 115, 22, 0.3)",
    },

    modalButtonSecondary: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "rgba(254, 215, 170, 0.5)",
      color: "#9a3412",
    },

    // Popup styles
    popupIcon: {
      fontSize: "56px",
      marginBottom: "20px",
      animation: "bounce 0.6s ease-out",
    },

    popupTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#9a3412",
      marginBottom: "16px",
      letterSpacing: "-0.5px",
    },

    popupMessage: {
      fontSize: "16px",
      color: "#c2410c",
      lineHeight: "1.6",
      marginBottom: "32px",
      opacity: 0.9,
    },
  };

  // Enhanced CSS animations
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.05; transform: scale(1); }
        50% { opacity: 0.1; transform: scale(1.05); }
      }

      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes slideUp {
        0% { 
          opacity: 0; 
          transform: translateY(30px) scale(0.95); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0) scale(1); 
        }
      }

      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }

      @keyframes slideInUp {
        0% { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }

      .back-btn:hover {
        background-color: rgba(249, 115, 22, 0.1) !important;
        border-color: rgba(249, 115, 22, 0.3) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(154, 52, 18, 0.2) !important;
      }

      .back-btn:active {
        transform: translateY(0) !important;
      }

      .user-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 16px 48px rgba(154, 52, 18, 0.15) !important;
      }

      .avatar-hover:hover {
        transform: scale(1.1) rotate(5deg) !important;
        box-shadow: 0 12px 40px rgba(249, 115, 22, 0.25) !important;
        border-color: rgba(249, 115, 22, 0.4) !important;
      }

      .avatar-hover:hover .avatar-edit {
        transform: scale(1.2) !important;
        box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4) !important;
      }

      .action-btn:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 12px 32px rgba(154, 52, 18, 0.15) !important;
      }

      .action-btn:hover .btn-icon {
        transform: scale(1.1) !important;
      }

      .action-btn:hover .btn-chevron {
        transform: translateX(4px) !important;
        opacity: 1 !important;
      }

      .logout-btn:hover {
        background-color: rgba(255, 247, 237, 0.9) !important;
        border-color: rgba(249, 115, 22, 0.3) !important;
      }

      .delete-btn:hover {
        background-color: rgba(254, 242, 242, 0.9) !important;
        border-color: rgba(252, 165, 165, 0.4) !important;
      }

      .action-btn:active {
        transform: translateY(-1px) !important;
      }

      .avatar-option:hover {
        transform: scale(1.15) !important;
        background-color: rgba(254, 215, 170, 0.6) !important;
        box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2) !important;
      }

      .modal-btn-primary:hover {
        background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4) !important;
      }

      .modal-btn-secondary:hover {
        background-color: rgba(255, 247, 237, 1) !important;
        border-color: rgba(249, 115, 22, 0.3) !important;
        transform: translateY(-2px) !important;
      }

      .modal-btn:active {
        transform: translateY(0) !important;
      }

      .fade-in {
        animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .fade-in-delay {
        opacity: 0;
        animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
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
    
    // Trigger animation after component mounts
    setTimeout(() => setIsLoaded(true), 100);
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
      toast?.("Avatar updated successfully! ✨", { type: 'success' });
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
    
    setShowAvatarSelector(false);
  };

  const handleAvatarCancel = () => {
    setSelectedAvatar(user.avatar || '🕉️');
    setShowAvatarSelector(false);
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      
      <button
        onClick={handleBack}
        style={styles.backButton}
        className="back-btn"
      >
        <span>←</span>
        Back
      </button>

      <div style={styles.header} className={isLoaded ? "fade-in" : ""}>
        <h1 style={styles.title}>Profile Settings</h1>
        <p style={styles.subtitle}>Manage your spiritual journey preferences</p>
      </div>

      <div style={styles.mainContent}>
        {/* User Info Card */}
        <div 
          style={styles.userCard} 
          className={`user-card ${isLoaded ? "fade-in" : ""}`}
        >
          <div style={styles.userCardGlow}></div>
          <div style={styles.userInfo}>
            <div 
              style={styles.avatar}
              className="avatar-hover"
              onClick={handleAvatarClick}
              title="Click to change avatar"
            >
              {user.avatar || selectedAvatar}
              <div style={styles.avatarEdit} className="avatar-edit">✏️</div>
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
        <div 
          style={styles.actionsCard}
          className={isLoaded ? "fade-in-delay" : ""}
        >
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
                <span style={styles.buttonIcon} className="btn-icon">🚪</span>
                <div style={styles.buttonText}>
                  <div>End Session</div>
                  <div style={styles.buttonSubtext}>Sign out of your spiritual journey</div>
                </div>
              </div>
              <span style={styles.chevron} className="btn-chevron">›</span>
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
                <span style={styles.buttonIcon} className="btn-icon">⚠️</span>
                <div style={styles.buttonText}>
                  <div>Delete Profile</div>
                  <div style={styles.buttonSubtext}>Permanently remove your account and journey data</div>
                </div>
              </div>
              <span style={styles.chevron} className="btn-chevron">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div style={styles.modalOverlay} onClick={handleAvatarCancel}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Choose Your Spiritual Avatar</h3>
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
            <div style={styles.modalButtons}>
              <button
                onClick={handleAvatarSave}
                style={{
                  ...styles.modalButton,
                  ...styles.modalButtonPrimary,
                }}
                className="modal-btn-primary modal-btn"
              >
                Save Avatar
              </button>
              <button
                onClick={handleAvatarCancel}
                style={{
                  ...styles.modalButton,
                  ...styles.modalButtonSecondary,
                }}
                className="modal-btn-secondary modal-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Account Popup */}
      {showDemoPopup && (
        <div style={styles.modalOverlay} onClick={handleDemoPopupClose}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupIcon}>🕉️</div>
            <h3 style={styles.popupTitle}>Demo Seeker Account</h3>
            <p style={styles.popupMessage}>
              Your demo spiritual journey will naturally conclude in 1 hour. 
              You may simply end your session instead of deletion.
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={handleDemoPopupLogout}
                style={{
                  ...styles.modalButton,
                  ...styles.modalButtonPrimary,
                }}
                className="modal-btn-primary modal-btn"
              >
                End Session
              </button>
              <button
                onClick={handleDemoPopupClose}
                style={{
                  ...styles.modalButton,
                  ...styles.modalButtonSecondary,
                }}
                className="modal-btn-secondary modal-btn"
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