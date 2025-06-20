// frontend/src/FCMToken.js
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { backend_url } from "./utils/backend";
import Cookies from "js-cookie";
import axios from "axios";

// Global flags to prevent duplicate operations
let isRegistrationInProgress = false;
let registrationListeners = [];
let currentFCMToken = null; // Cache current token
let tokenSaveInProgress = false;

// Multi-language fallback messages
const getFallbackMessages = (language) => {
  const messages = {
    english: {
      title: '🕉️ Divine Wisdom Awaits',
      body: 'A new message from the Bhagavad Gita',
      readNow: 'Read Now',
      later: 'Later'
    },
    hindi: {
      title: '🕉️ दिव्य ज्ञान की प्रतीक्षा',
      body: 'भगवद् गीता से एक नया संदेश',
      readNow: 'अभी पढ़ें',
      later: 'बाद में'
    },
    sanskrit: {
      title: '🕉️ दिव्यं ज्ञानम् प्रतीक्षते',
      body: 'भगवद्गीतायाः नूतनं संदेशम्',
      readNow: 'अधुना पठतु',
      later: 'पश्चात्'
    }
  };
  
  return messages[language] || messages.english;
};

// Function to get user's language preference
const getUserLanguagePreference = () => {
  try {
    // Try to get from localStorage first
    const preferences = localStorage.getItem('notificationPreferences');
    if (preferences) {
      const parsed = JSON.parse(preferences);
      return parsed.language || 'english';
    }
    
    // Try to get from cookies as fallback
    const cookiePrefs = Cookies.get('userLanguagePreference');
    if (cookiePrefs) {
      return cookiePrefs;
    }
    
    // Default to English
    return 'english';
  } catch (error) {
    console.warn('Error getting user language preference:', error);
    return 'english';
  }
};

// Function to save token to backend with duplicate prevention
const saveTokenToBackend = async (token) => {
  // Prevent duplicate saves
  if (tokenSaveInProgress) {
    console.log('Token save already in progress, skipping...');
    return;
  }

  // Check if token is already cached and same
  if (currentFCMToken === token) {
    console.log('Token unchanged, skipping backend save');
    return;
  }

  try {
    tokenSaveInProgress = true;
    const authToken = Cookies.get("token");
    //console.log("Auth Token from Cookie:", authToken);
    const response = await axios.post(
      `${backend_url}/api/notifications/save-token`,
      { token: token },
      // {
      //   headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      // }
    );
    
    if (response.status === 200) {
      if (response.data.alreadyExists) {
        console.log("Token already exists in backend, no update needed");
      } else {
        console.log("Token saved successfully to backend");
      }
      // Cache the token after successful save
      currentFCMToken = token;
    }
  } catch (backendError) {
  if (backendError.response) {
    console.error("Backend response error:", backendError.response.data);
    console.error("Status code:", backendError.response.status);
  } else {
    console.error("Token save error:", backendError.message);
  }
  } finally {
    tokenSaveInProgress = false;
  }
};

const FCMToken = async (navigate = null) => {
  try {
    // Only work on native Android platform
    if (!Capacitor.isNativePlatform()) {
      console.log('FCM notifications only supported on native Android platform');
      return null;
    }

    // Prevent duplicate registrations
    if (isRegistrationInProgress) {
      console.log('Registration already in progress, skipping...');
      return null;
    }

    // If we already have a token cached, return it
    if (currentFCMToken) {
      console.log('Using cached FCM token:', currentFCMToken);
      return currentFCMToken;
    }

    isRegistrationInProgress = true;
    console.log('Running on native Android platform');
    
    // Clean up any existing listeners first
    cleanupListeners();
    
    // Request permission for push notifications
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    
    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permissions not granted');
      isRegistrationInProgress = false;
      return null;
    }
    
    console.log('Push notification permissions granted');
    
    // Set up listeners BEFORE calling register
    return new Promise((resolve, reject) => {
      let isResolved = false;
      
      // Set up registration success listener
      const registrationListener = PushNotifications.addListener('registration', async (token) => {
        if (isResolved) return;
        isResolved = true;
        
        console.log('Push registration success, FCM token: ' + token.value);
        
        try {
          // Save token to backend (with duplicate prevention)
          await saveTokenToBackend(token.value);
        } catch (backendError) {
          console.error("Failed to save token to backend:", backendError);
          // Don't reject the promise, just log the error
        }
        
        // Clean up and resolve
        cleanup();
        resolve(token.value);
      });
      
      // Set up registration error listener
      const errorListener = PushNotifications.addListener('registrationError', (error) => {
        if (isResolved) return;
        isResolved = true;
        
        console.error('Error on registration: ' + JSON.stringify(error));
        cleanup();
        reject(error);
      });
      
      // Store listeners for cleanup
      registrationListeners.push(registrationListener, errorListener);
      
      // Set up one-time notification listeners (only if not already set)
      if (!window.fcmNotificationListenersSet) {
        setupNotificationListeners(navigate);
        window.fcmNotificationListenersSet = true;
      }
      
      // Set timeout to avoid hanging forever
      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(new Error('Registration timeout - no response after 15 seconds'));
        }
      }, 15000);
      
      // Cleanup function
      const cleanup = () => {
        clearTimeout(timeoutId);
        cleanupListeners();
        isRegistrationInProgress = false;
      };
      
      // Now register for push notifications
      PushNotifications.register().catch((error) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      });
    });
    
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
    isRegistrationInProgress = false;
    return null;
  }
};

// Clean up existing listeners
const cleanupListeners = () => {
  registrationListeners.forEach(listener => {
    try {
      listener.remove();
    } catch (e) {
      console.warn('Failed to remove listener:', e);
    }
  });
  registrationListeners = [];
};

// Set up notification listeners (only once)
const setupNotificationListeners = (navigate) => {
  // Handle foreground notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received in foreground: ', notification);
    showPremiumNotification(notification, navigate);
  });
  
  // Handle notification click - Navigate to Notifications page
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
    
    // Add transition effect and navigate
    addPageTransitionEffect();
    
  window.location.href = '/notifications';
  });
};

// Premium notification display for Android with multi-language support
const showPremiumNotification = (notification, navigate) => {
  // Get user's language preference
  const userLanguage = getUserLanguagePreference();
  const fallbackMessages = getFallbackMessages(userLanguage);
  
  console.log('Showing notification in language:', userLanguage);
  console.log('Notification data:', notification);
  
  // Prevent duplicate notifications - remove any existing ones first
  const existing = document.querySelectorAll('.premium-notification');
  existing.forEach(el => el.remove());
  
  // Create premium notification container
  const notificationContainer = document.createElement('div');
  notificationContainer.className = 'premium-notification';
  
  // Get current time for beautiful timestamp
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Use notification data if available, otherwise use language-appropriate fallbacks
  const title = notification.title || fallbackMessages.title;
  const body = notification.body || fallbackMessages.body;
  
  notificationContainer.innerHTML = `
    <div class="notification-backdrop"></div>
    <div class="notification-card">
      <div class="notification-header">
        <div class="app-icon">
          <div class="om-symbol">🕉️</div>
        </div>
        <div class="app-info">
          <div class="app-name">Geeta GPT</div>
          <div class="notification-time">${timeString}</div>
        </div>
        <button class="close-btn" onclick="this.closest('.premium-notification').remove()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-body">${body}</div>
      </div>
      
      <div class="notification-actions">
        <button class="action-btn secondary" onclick="this.closest('.premium-notification').remove()">
          ${fallbackMessages.later}
        </button>
        <button class="action-btn primary" onclick="handleNotificationClick()">
          ${fallbackMessages.readNow}
        </button>
      </div>
      
      <div class="notification-progress"></div>
    </div>
  `;
  
  // Add beautiful styles
  addPremiumNotificationStyles();
  
  // Store navigate function globally for button click
  window.notificationNavigate = navigate;
  
  document.body.appendChild(notificationContainer);
  
  // Animate in
  requestAnimationFrame(() => {
    notificationContainer.classList.add('show');
  });
  
  // Auto-dismiss after 8 seconds with progress bar
  const progressBar = notificationContainer.querySelector('.notification-progress');
  progressBar.style.animation = 'progress 8s linear forwards';
  
  setTimeout(() => {
    if (document.body.contains(notificationContainer)) {
      notificationContainer.classList.add('hide');
      setTimeout(() => {
        if (document.body.contains(notificationContainer)) {
          document.body.removeChild(notificationContainer);
        }
      }, 400);
    }
  }, 8000);
};

// Global function for notification button clicks (simplified)
window.handleNotificationClick = () => {
  const notificationEl = document.querySelector('.premium-notification');
  if (notificationEl) {
    notificationEl.classList.add('hide');
    setTimeout(() => {
      if (document.body.contains(notificationEl)) {
        document.body.removeChild(notificationEl);
      }
    }, 300);
  }

  // Delay navigation slightly to allow for smooth transition
  setTimeout(() => {
    window.location.href = '/notifications';
  }, 300);
};

// Add premium notification styles
const addPremiumNotificationStyles = () => {
  if (document.getElementById('premium-notification-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'premium-notification-styles';
  styles.textContent = `
    .premium-notification {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999999;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 20px;
      opacity: 0;
      transform: translateY(-100px);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    .premium-notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .premium-notification.hide {
      opacity: 0;
      transform: translateY(-50px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .notification-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .notification-card {
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 20px;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 8px 16px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(255, 255, 255, 0.5);
      max-width: 380px;
      width: 90%;
      margin: 0 20px;
      overflow: hidden;
      transform: translateZ(0);
    }
    
    .notification-header {
      display: flex;
      align-items: center;
      padding: 20px 20px 0 20px;
      gap: 12px;
    }
    
    .app-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }
    
    .om-symbol {
      font-size: 22px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    .app-info {
      flex: 1;
    }
    
    .app-name {
      font-weight: 600;
      font-size: 16px;
      color: #1a202c;
      margin-bottom: 2px;
    }
    
    .notification-time {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    
    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .close-btn:hover {
      background: #e2e8f0;
      color: #475569;
      transform: scale(1.05);
    }
    
    .notification-content {
      padding: 16px 20px;
    }
    
    .notification-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .notification-body {
      font-size: 15px;
      color: #4a5568;
      line-height: 1.5;
      margin-bottom: 0;
    }
    
    .notification-actions {
      display: flex;
      gap: 12px;
      padding: 0 20px 20px 20px;
    }
    
    .action-btn {
      flex: 1;
      padding: 12px 20px;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    
    .action-btn.secondary {
      background: #f1f5f9;
      color: #64748b;
    }
    
    .action-btn.secondary:hover {
      background: #e2e8f0;
      color: #475569;
      transform: translateY(-1px);
    }
    
    .action-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .action-btn.primary:active {
      transform: translateY(0);
    }
    
    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 0 0 20px 20px;
      transform: scaleX(0);
      transform-origin: left;
    }
    
    @keyframes progress {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    
    @media (max-width: 480px) {
      .premium-notification {
        padding-top: 10px;
      }
      
      .notification-card {
        margin: 0 10px;
        border-radius: 16px;
      }
      
      .notification-header {
        padding: 16px 16px 0 16px;
      }
      
      .notification-content {
        padding: 12px 16px;
      }
      
      .notification-actions {
        padding: 0 16px 16px 16px;
        flex-direction: column;
      }
      
      .action-btn {
        padding: 14px 20px;
      }
    }
    
    /* Beautiful page transition effect */
    .page-transition {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 999998;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .page-transition.active {
      transform: translateY(0);
    }
    
    .page-transition::after {
      content: '🕉️';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `;
  
  document.head.appendChild(styles);
};

// Add beautiful page transition effect
const addPageTransitionEffect = () => {
  const existing = document.querySelector('.page-transition');
  if (existing) return;
  
  const transition = document.createElement('div');
  transition.className = 'page-transition';
  document.body.appendChild(transition);
  
  requestAnimationFrame(() => {
    transition.classList.add('active');
  });
  
  setTimeout(() => {
    if (document.body.contains(transition)) {
      document.body.removeChild(transition);
    }
  }, 800);
};

// Export function to reset cached token (useful for testing or logout)
export const resetFCMToken = () => {
  currentFCMToken = null;
  console.log('FCM token cache reset');
};

export default FCMToken;