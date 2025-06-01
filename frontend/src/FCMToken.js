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
            //const authToken = Cookies.get("token");
            const response = await axios.post(
              `${backend_url}/api/notifications/save-token`,
              { token: token.value },
              // {
              //   headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
              // }
            );
            
            if (response.status === 200) {
              console.log("Token saved successfully to backend");
            }
          } catch (backendError) {
            console.error("Failed to save token to backend:", backendError);
            // Don't reject here, we still want to return the token
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
        
        // Set up notification listeners (these stay active)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
        });
        
        // Handle notification click - Navigate to Notifications page
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
          
          // Navigate to Notifications page when notification is clicked
          if (navigate) {
            navigate('/notifications');
          } else {
            // Fallback for web - use window location
            window.location.href = '/notifications';
          }
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
      console.log('Running on web platform, using original implementation');
      return await getWebFCMToken(navigate);
    }
    
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
    return null;
  }
};

// Original web implementation as fallback
const getWebFCMToken = async (navigate = null) => {
  try {
    // Import Firebase messaging only for web
    const { getToken, onMessage } = await import("firebase/messaging");
    const { messaging } = await import("./firebase");
    
    // Request notification permission
    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);

    if (permission !== "granted") {
      console.warn("Notifications not allowed");
      alert(
        "Please enable notifications to receive daily Bhagavad Gita quotes!"
      );
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

      // Handle foreground messages (when app is open)
      onMessage(messaging, (payload) => {
        console.log('Message received in foreground: ', payload);
        
        // Show notification manually for foreground messages
        if (Notification.permission === 'granted') {
          const notification = new Notification(payload.notification?.title || 'New Message', {
            body: payload.notification?.body || 'You have a new message',
            icon: payload.notification?.icon || '/favicon.ico',
            data: payload.data || {}
          });
          
          // Handle click on foreground notification
          notification.onclick = function(event) {
            event.preventDefault();
            notification.close();
            
            // Navigate to notifications page
            if (navigate) {
              navigate('/notifications');
            } else {
              window.location.href = '/notifications';
            }
          };
        }
      });

      // Test notification
      try {
        const testNotification = new Notification("🕉️ Geeta GPT Ready!", {
          body: "You will now receive daily Bhagavad Gita wisdom",
          icon: "/favicon.ico",
        });
        
        // Handle click on test notification
        testNotification.onclick = function(event) {
          event.preventDefault();
          testNotification.close();
          
          if (navigate) {
            navigate('/notifications');
          } else {
            window.location.href = '/notifications';
          }
        };

        setTimeout(() => testNotification.close(), 4000);
      } catch (notifError) {
        console.log("Test notification failed:", notifError);
      }

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

export default FCMToken;