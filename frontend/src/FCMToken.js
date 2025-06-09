// frontend/src/FCMToken.js
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { backend_url } from "./utils/backend";
import Cookies from "js-cookie";
import axios from "axios";

const FCMToken = async (navigate = null) => {
  try {
    // Check if running on native platform
    if (Capacitor.isNativePlatform()) {
      console.log('Running on native platform');
      
      // Request permission for push notifications
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permissions not granted');
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
            // Save token to backend
            const response = await axios.post(
              `${backend_url}/api/notifications/save-token`,
              { token: token.value }
            );
            
            if (response.status === 200) {
              console.log("Token saved successfully to backend");
            }
          } catch (backendError) {
            console.error("Failed to save token to backend:", backendError);
          }
          
          // Clean up listeners
          registrationListener.remove();
          errorListener.remove();
          
          resolve(token.value);
        });
        
        // Set up registration error listener
        const errorListener = PushNotifications.addListener('registrationError', (error) => {
          if (isResolved) return;
          isResolved = true;
          
          console.error('Error on registration: ' + JSON.stringify(error));
          
          // Clean up listeners
          registrationListener.remove();
          errorListener.remove();
          
          reject(error);
        });
        
        // Beautiful foreground notifications for native platforms
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received in foreground: ', notification);
          showPremiumNotification(notification, navigate);
        });
        
        // Handle notification click - Navigate to Notifications page
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
          
          // Beautiful transition to notifications page
          addPageTransitionEffect();
          
          setTimeout(() => {
            if (navigate) {
              navigate('/notifications');
            } else {
              window.location.href = '/notifications';
            }
          }, 200);
        });
        
        // Set timeout to avoid hanging forever
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            registrationListener.remove();
            errorListener.remove();
            reject(new Error('Registration timeout - no response after 15 seconds'));
          }
        }, 15000);
        
        // Now register for push notifications
        PushNotifications.register().catch((error) => {
          if (!isResolved) {
            isResolved = true;
            registrationListener.remove();
            errorListener.remove();
            reject(error);
          }
        });
      });
      
    } else {
      // Fallback to web implementation for browsers
      console.log('Running on web platform, using beautiful web implementation');
      return await getBeautifulWebFCMToken(navigate);
    }
    
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
    return null;
  }
};

// Premium notification display for all platforms
const showPremiumNotification = (notification, navigate) => {
  // Remove any existing notifications first
  const existing = document.querySelectorAll('.premium-notification');
  existing.forEach(el => el.remove());
  
  // Create premium notification container
  const notificationContainer = document.createElement('div');
  notificationContainer.className = 'premium-notification';
  
  // Get current time for beautiful timestamp
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
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
        <div class="notification-title">${notification.title || '🕉️ Divine Wisdom Awaits'}</div>
        <div class="notification-body">${notification.body || 'A new message from the Bhagavad Gita'}</div>
      </div>
      
      <div class="notification-actions">
        <button class="action-btn secondary" onclick="this.closest('.premium-notification').remove()">
          Later
        </button>
        <button class="action-btn primary" onclick="handleNotificationClick('${escape(JSON.stringify(notification))}')">
          Read Now
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

// Global function for notification button clicks
window.handleNotificationClick = (notificationData) => {
  const notification = JSON.parse(unescape(notificationData));
  
  // Remove notification with beautiful animation
  const notificationEl = document.querySelector('.premium-notification');
  if (notificationEl) {
    notificationEl.classList.add('hide');
    setTimeout(() => {
      if (document.body.contains(notificationEl)) {
        document.body.removeChild(notificationEl);
      }
    }, 300);
  }
  
  // Add page transition effect
  addPageTransitionEffect();
  
  // Navigate after transition
  setTimeout(() => {
    if (window.notificationNavigate) {
      window.notificationNavigate('/notifications');
    } else {
      window.location.href = '/notifications';
    }
  }, 200);
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

// Beautiful web implementation
const getBeautifulWebFCMToken = async (navigate = null) => {
  try {
    // Import Firebase messaging only for web
    const { getToken, onMessage } = await import("firebase/messaging");
    const { messaging } = await import("./firebase");
    
    // Request notification permission with beautiful UI
    const permission = await requestNotificationPermissionBeautifully();
    console.log("Notification permission:", permission);

    if (permission !== "granted") {
      console.warn("Notifications not allowed");
      return null;
    }

    // Register service worker if not already registered
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("Service Worker registered:", registration);
        await navigator.serviceWorker.ready;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }

    const currentToken = await getToken(messaging, {
      vapidKey:
        "BB4_1ASpKcUEyiBS5B8hWK-BZVvN2TOB2eWBGx-XPC5tJXp5VrD22EmyF7u_DmLoI3jHaAi6NTtX8WXYCYF-_sw",
    });

    if (currentToken) {
      console.log("FCM Token:", currentToken);

      // Handle foreground messages with beautiful notifications
      onMessage(messaging, (payload) => {
        console.log('Message received in foreground: ', payload);
        
        // Show premium notification
        showPremiumNotification({
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: payload.data
        }, navigate);
      });

      // Beautiful welcome notification
      setTimeout(() => {
        showPremiumNotification({
          title: "🕉️ Geeta GPT Ready!",
          body: "You will now receive daily Bhagavad Gita wisdom and divine guidance"
        }, navigate);
      }, 1000);

      // Save token to backend
      try {
        const authToken = Cookies.get("token");
        const response = await axios.post(
          `${backend_url}/api/notifications/save-token`,
          { token: currentToken },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        );
        
        if (response.status === 200) {
          console.log("Token saved successfully to backend");
        }
      } catch (backendError) {
        console.error("Failed to save token to backend:", backendError);
      }

      return currentToken;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Web FCM token error:", err);
    return null;
  }
};

// Beautiful permission request
const requestNotificationPermissionBeautifully = async () => {
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  // Show beautiful permission dialog
  return new Promise((resolve) => {
    showPermissionDialog(resolve);
  });
};

// Beautiful permission dialog
const showPermissionDialog = (callback) => {
  const dialog = document.createElement('div');
  dialog.className = 'permission-dialog';
  
  dialog.innerHTML = `
    <div class="permission-backdrop"></div>
    <div class="permission-card">
      <div class="permission-icon">
        <div class="om-icon">🕉️</div>
        <div class="notification-bell">🔔</div>
      </div>
      
      <div class="permission-content">
        <h3 class="permission-title">Stay Connected to Divine Wisdom</h3>
        <p class="permission-message">
          Allow Geeta GPT to send you daily verses from the Bhagavad Gita 
          and spiritual insights to guide your journey.
        </p>
      </div>
      
      <div class="permission-actions">
        <button class="permission-btn secondary" onclick="handlePermissionResponse(false)">
          Not Now
        </button>
        <button class="permission-btn primary" onclick="handlePermissionResponse(true)">
          Allow Notifications
        </button>
      </div>
    </div>
  `;
  
  // Add permission dialog styles
  addPermissionDialogStyles();
  
  document.body.appendChild(dialog);
  
  // Store callback
  window.permissionCallback = callback;
  
  // Animate in
  requestAnimationFrame(() => {
    dialog.classList.add('show');
  });
};

// Handle permission response
window.handlePermissionResponse = async (allow) => {
  const dialog = document.querySelector('.permission-dialog');
  
  if (allow) {
    // Request actual permission
    const permission = await Notification.requestPermission();
    window.permissionCallback(permission);
  } else {
    window.permissionCallback('denied');
  }
  
  // Remove dialog
  if (dialog) {
    dialog.classList.add('hide');
    setTimeout(() => {
      if (document.body.contains(dialog)) {
        document.body.removeChild(dialog);
      }
    }, 300);
  }
};

// Add permission dialog styles
const addPermissionDialogStyles = () => {
  if (document.getElementById('permission-dialog-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'permission-dialog-styles';
  styles.textContent = `
    .permission-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.9);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .permission-dialog.show {
      opacity: 1;
      transform: scale(1);
    }
    
    .permission-dialog.hide {
      opacity: 0;
      transform: scale(0.95);
      transition: all 0.2s ease;
    }
    
    .permission-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .permission-card {
      position: relative;
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      max-width: 400px;
      width: 90%;
      margin: 0 20px;
      text-align: center;
      overflow: hidden;
    }
    
    .permission-icon {
      position: relative;
      padding: 32px 32px 16px 32px;
    }
    
    .om-icon {
      font-size: 48px;
      margin-bottom: 12px;
      display: block;
      animation: gentle-pulse 2s ease-in-out infinite;
    }
    
    .notification-bell {
      position: absolute;
      top: 24px;
      right: 32px;
      font-size: 24px;
      animation: bell-ring 2s ease-in-out infinite;
    }
    
    @keyframes gentle-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes bell-ring {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(10deg); }
      75% { transform: rotate(-10deg); }
    }
    
    .permission-content {
      padding: 0 32px 24px 32px;
    }
    
    .permission-title {
      font-size: 22px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    
    .permission-message {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.5;
      margin: 0;
    }
    
    .permission-actions {
      display: flex;
      gap: 12px;
      padding: 0 32px 32px 32px;
    }
    
    .permission-btn {
      flex: 1;
      padding: 14px 24px;
      border-radius: 14px;
      border: none;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .permission-btn.secondary {
      background: #f7fafc;
      color: #718096;
    }
    
    .permission-btn.secondary:hover {
      background: #edf2f7;
      color: #4a5568;
      transform: translateY(-1px);
    }
    
    .permission-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
    }
    
    .permission-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    @media (max-width: 480px) {
      .permission-card {
        border-radius: 20px;
      }
      
      .permission-icon {
        padding: 24px 24px 12px 24px;
      }
      
      .om-icon {
        font-size: 40px;
      }
      
      .notification-bell {
        top: 20px;
        right: 24px;
        font-size: 20px;
      }
      
      .permission-content {
        padding: 0 24px 20px 24px;
      }
      
      .permission-title {
        font-size: 20px;
      }
      
      .permission-message {
        font-size: 15px;
      }
      
      .permission-actions {
        flex-direction: column;
        padding: 0 24px 24px 24px;
      }
    }
  `;
  
  document.head.appendChild(styles);
};

export default FCMToken;