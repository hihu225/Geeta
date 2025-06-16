import { useState, useEffect , useContext} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from 'lucide-react';
import { FiSettings } from 'react-icons/fi';
import { MdNotificationsActive } from "react-icons/md";
import NotificationSettings from "./NotificationSettings";
import Notifications from "./Notifications";
import "./hihu.css";
import { ThemeContext } from "./ThemeContext";
const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🕉️');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [feedbackText, setFeedbackText] = useState('');
  const [notifications, setNotifications] = useState([
  {
    id: 1,
    title: "Daily Wisdom Reminder",
    message: "Time for your daily Bhagavad Gita verse reflection",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true, 
    type: "wisdom"
  },
  {
    id: 2,
    title: "Meditation Session Complete", 
    message: "You've completed your 15-minute morning meditation",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    type: "achievement"
  }
]);
  const avatarOptions = [
  { icon: '🕉️', name: 'Om' },
  { icon: '🪷', name: 'Lotus' },
  { icon: '🔱', name: 'Trishul' },
  { icon: '🐚', name: 'Conch' },
  { icon: '🌸', name: 'Flower' },
  { icon: '🌟', name: 'Star' },
  { icon: '🔥', name: 'Sacred Fire' },
  { icon: '🌙', name: 'Moon' },
  { icon: '☀️', name: 'Sun' },
  { icon: '🦚', name: 'Peacock' },
  { icon: '🎐', name: 'Wind Chime' },
  { icon: '🌿', name: 'Tulsi Leaf' },
  { icon: '🍃', name: 'Sacred Leaf' },
  { icon: '🪔', name: 'Oil Lamp' },
  { icon: '🪘', name: 'Drum (Damaru)' },
  { icon: '🪯', name: 'Dharma Wheel' },
  { icon: '🧘', name: 'Meditator' },
  { icon: '🕊️', name: 'Peace Dove' },
  { icon: '⚖️', name: 'Balance (Dharma)' },
  { icon: '🗻', name: 'Himalayas' },
];


  const styles = {

    header: {
      maxWidth: "600px",
      margin: "50px auto 40px auto",
      textAlign: "center",
    },

    mainContent: {
      maxWidth: "600px",
      margin: "0 auto",
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

    buttonGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
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

    popupIcon: {
      fontSize: "48px",
      marginBottom: "16px",
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
    aboutButton: {
  borderColor: "#fed7aa",
  backgroundColor: "#fff7ed",
  color: "#9a3412",
},


supportGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "16px",
  marginTop: "16px",
},

supportCard: {
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #fed7aa",
  backgroundColor: "#fff7ed",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
},

supportIcon: {
  fontSize: "32px",
  marginBottom: "12px",
  display: "block",
},


supportDescription: {
  fontSize: "14px",
  color: "#c2410c",
  lineHeight: "1.4",
},

modalContent: {
  maxHeight: "70vh",
  overflowY: "auto",
  textAlign: "left",
},

modalText: {
  fontSize: "15px",
  lineHeight: "1.6",
  marginBottom: "16px",
},

feedbackTextarea: {
  width: "100%",
  minHeight: "120px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #fed7aa",
  fontSize: "14px",
  fontFamily: "inherit",
  resize: "vertical",
  marginBottom: "16px",
},

verse: {
  fontStyle: "italic",
  color: "#9a3412",
  backgroundColor: "#fff7ed",
  padding: "16px",
  borderRadius: "8px",
  borderLeft: "4px solid #f97316",
  marginBottom: "16px",
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
  const handleAboutClick = () => {
  setShowAboutModal(true);
};

const handlePrivacyClick = () => {
  setShowPrivacyModal(true);
};

const handleFeedbackClick = () => {
  setShowFeedbackModal(true);
};

const handleContactSupport = () => {
  window.location.href = 'mailto:vanshika.tripathi14072001@gmail.com?subject=Spiritual Guidance Chatbot - Support Request';
};

const handleSubmitFeedback = () => {
  if (feedbackText.trim()) {
    // Send feedback via email
    const subject = encodeURIComponent('Spiritual Guidance Chatbot - User Feedback');
    const body = encodeURIComponent(`User: ${user?.name || 'Anonymous'}\nEmail: ${user?.email || 'Not provided'}\n\nFeedback:\n${feedbackText}`);
    window.location.href = `mailto:hihu2005ag@gmail.com?subject=${subject}&body=${body}`;
    
    toast?.("Thank you for your valuable feedback! 🙏", { type: 'success' });
    setFeedbackText('');
    setShowFeedbackModal(false);
  } else {
    toast?.("Please share your thoughts before submitting.", { type: 'warning' });
  }
};
const handleNotificationSettings = () => {
  navigate('/notification-settings');
};

const handleViewNotifications = () => {
  navigate('/notifications');
};

const getUnreadNotificationCount = () => {
  return notifications.filter(notif => !notif.read).length;
};
const handleCloseModal = (setter) => {
  setter(false);
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
    <div className={`container-acc ${theme}`}>
      <button onClick={handleBack} className={`back-btn-acc ${theme}`}>
  <ArrowLeft size={20} className="icon" />
  Back
</button>


      <div style={styles.header}>
        <div className={`title-container ${theme}`}>
  <h1 className={`title-text ${theme}`}>Profile Settings</h1>
  <div className={`subtitle-acc ${theme}`}>
    Manage your spiritual journey preferences
  </div>
</div>

      </div>

      <div style={styles.mainContent}>
        {/* User Info Card */}
        <div className={`user-card ${theme}`}>
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
              <div className={`user-name ${theme}`}>{user.name}</div>
              <div className={`user-email ${theme}`}>{user.email}</div>
              {user.isDemo && (
                <div className={`demo-tag ${theme}`}>Demo Seeker</div>
              )}
            </div>
          </div>
        </div>
        <div className={`support-section ${theme}`}>
  <h2 className={`section-title ${theme}`}>Notifications & Alerts</h2>
  <div style={styles.supportGrid}>
    <div 
  className={`support-card ${theme}`}
      onClick={handleNotificationSettings}
    >
      <FiSettings size={32} color={theme === "dark" ? "#fcd34d" : "#9a3412"} style={{marginBottom: "18px", marginTop:"7px"}} />
      <div
  className={`support-title ${theme}`}
>
  Notification Settings
</div>

      <div style={styles.supportDescription}>
        Customize your spiritual reminders and guidance alerts
      </div>
    </div>

    <div 
  className={`support-card ${theme}`}
  onClick={handleViewNotifications}
>
  <span style={styles.supportIcon}>
    <MdNotificationsActive size={32} color={theme === "dark" ? "#fcd34d" : "#9a3412"} />
    {getUnreadNotificationCount() > 0 && (
      <span style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: '#f97316',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
      }}>
        {getUnreadNotificationCount()}
      </span>
    )}
  </span>
  <div className={`support-title ${theme}`}>
    View Notifications
  </div>
  <div style={styles.supportDescription}>
    {getUnreadNotificationCount() > 0 
      ? `${getUnreadNotificationCount()} unread notification${getUnreadNotificationCount() > 1 ? 's' : ''} - Check your recent spiritual insights`
      : 'Check your recent spiritual insights and reminders'
    }
  </div>
</div>
  </div>
</div>
        <div className={`support-section ${theme}`}>
  <h2 className={`section-title ${theme}`}>Support & Information</h2>
  <div style={styles.supportGrid}>
    <div 
      className={`support-card ${theme}`}
      onClick={handleAboutClick}
    >
      <span style={styles.supportIcon}>📖</span>
      <div className={`section-title ${theme}`}>About This App</div>
      <div style={styles.supportDescription}>
        Learn about our spiritual guidance system powered by Bhagavad Gita wisdom
      </div>
    </div>

    <div 
      className={`support-card ${theme}`}
      onClick={handleContactSupport}
    >
      <span style={styles.supportIcon}>📧</span>
      <div className={`section-title ${theme}`}>Contact Support</div>
<div style={styles.supportDescription}>
  Having trouble? Get in touch for technical assistance or general inquiries.
</div>

    </div>

    <div 
      className={`support-card ${theme}`}
      onClick={handleFeedbackClick}
    >
      <span style={styles.supportIcon}>💭</span>
      <div className={`section-title ${theme}`}>Share Feedback</div>
      <div style={styles.supportDescription}>
        Help us improve your spiritual journey experience
      </div>
    </div>

    <div 
      className={`support-card ${theme}`}
      onClick={handlePrivacyClick}
    >
      <span style={styles.supportIcon}>🔒</span>
      <div className={`section-title ${theme}`}>Privacy & Terms</div>
      <div style={styles.supportDescription}>
        Understand how we protect your spiritual journey data
      </div>
    </div>
  </div>
</div>
        {/* Actions Card */}
        <div className={`actions-card ${theme}`}>
          <h2 className={`section-title ${theme}`}>Account Actions</h2>
          
          <div style={styles.buttonGroup}>
            {/* Logout Button */}
            <button
  onClick={handleLogout}
  className={`logout-btn ${theme}`}
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
  className={`delete-btn ${theme}`}
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
          <div className={`popup-container ${theme}`} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupIcon}>🕉️</div>
            <h3 className={`popup-title ${theme}`}>Demo Seeker Account</h3>
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
      {/* About Modal */}
{showAboutModal && (
  <div style={styles.popupOverlay} onClick={() => handleCloseModal(setShowAboutModal)}>
    <div className={`popup-container ${theme}`} onClick={(e) => e.stopPropagation()}>
      <div style={styles.popupIcon}>🕉️</div>
      <h3 className={`popup-title ${theme}`}>
  About Geeta Gpt <br />
  <span>(Spiritual Guidance Chatbot)</span>
</h3>


      <div style={styles.modalContent}>
        <div style={styles.verse}>
          "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।<br/>
          अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्।।"<br/>
          <small>- Bhagavad Gita 4.7</small>
        </div>
        <p style={styles.modalText}>
          Our AI-powered spiritual guidance chatbot draws wisdom from the timeless teachings of the Bhagavad Gita to provide personalized spiritual counsel and life guidance.
        </p>
        <p style={styles.modalText}>
          <strong>Features:</strong><br/>
          • Personalized spiritual guidance based on Gita's teachings<br/>
          • AI-powered responses using advanced language models<br/>
          • Secure and private conversations<br/>
          • Multilingual support for universal accessibility
        </p>
        <p style={styles.modalText}>
          <strong>Technology:</strong> Powered by Google's Gemini AI for intelligent, contextual responses rooted in ancient wisdom.
        </p>
      </div>
      <div style={styles.popupButtons}>
        <button
          onClick={() => handleCloseModal(setShowAboutModal)}
          style={{...styles.popupButton, ...styles.popupButtonPrimary}}
          className="popup-btn-primary"
        >
          Understood 🙏
        </button>
      </div>
    </div>
  </div>
)}

{/* Privacy Modal */}
{showPrivacyModal && (
  <div style={styles.popupOverlay} onClick={() => handleCloseModal(setShowPrivacyModal)}>
    <div className={`popup-container ${theme}`} onClick={(e) => e.stopPropagation()}>
      <div style={styles.popupIcon}>🔒</div>
      <h3 className={`popup-title ${theme}`}>Privacy & Data Protection</h3>
      <div style={styles.modalContent}>
        <p style={styles.modalText}>
          <strong>Your Privacy Matters:</strong><br/>
          We respect your spiritual journey and maintain strict confidentiality of your conversations.
        </p>
        <p style={styles.modalText}>
          <strong>Data We Collect:</strong><br/>
          • Chat messages for providing relevant guidance<br/>
          • Basic profile information (name, avatar preference)<br/>
          • Session data for improving our service
        </p>
        <p style={styles.modalText}>
          <strong>Data We Don't Share:</strong><br/>
          • Personal conversations remain private<br/>
          • No selling of personal information<br/>
          • Secure encryption for all communications
        </p>
        <p style={styles.modalText}>
          <strong>Your Rights:</strong> You can request data deletion, export your conversations, or modify your privacy settings at any time.
        </p>
      </div>
      <div style={styles.popupButtons}>
        <button
          onClick={() => handleCloseModal(setShowPrivacyModal)}
          style={{...styles.popupButton, ...styles.popupButtonPrimary}}
          className="popup-btn-primary"
        >
          Accept
        </button>
      </div>
    </div>
  </div>
)}

{/* Feedback Modal */}
{showFeedbackModal && (
  <div style={styles.popupOverlay} onClick={() => handleCloseModal(setShowFeedbackModal)}>
    <div className={`popup-container ${theme}`} onClick={(e) => e.stopPropagation()}>
      <div style={styles.popupIcon}>💭</div>
      <h3 className={`popup-title ${theme}`}>Share Your Experience</h3>
      <div style={styles.modalContent}>
        <p style={styles.modalText}>
          Your feedback helps us improve the spiritual guidance experience for all seekers.
        </p>
        <textarea
          style={styles.feedbackTextarea}
          placeholder="Share your thoughts, suggestions, or experiences with our spiritual guidance chatbot..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />
      </div>
      <div style={styles.popupButtons}>
        <button
          onClick={handleSubmitFeedback}
          style={{...styles.popupButton, ...styles.popupButtonPrimary}}
          className="popup-btn-primary"
        >
          Submit Feedback
        </button>
        <button
          onClick={() => handleCloseModal(setShowFeedbackModal)}
          style={{...styles.popupButton, ...styles.popupButtonSecondary}}
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