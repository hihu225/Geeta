// frontend/src/FCMToken.js
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { backend_url } from "./utils/backend";
import Cookies from "js-cookie";
import axios from "axios";
const FCMToken = async () => {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return null;
    }

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

        // Wait for service worker to be ready
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

      // Test notification
      try {
        const testNotification = new Notification("🕉️ Geeta GPT Ready!", {
          body: "You will now receive daily Bhagavad Gita wisdom",
          icon: "/favicon.ico",
        });

        setTimeout(() => testNotification.close(), 4000);
      } catch (notifError) {
        console.log("Test notification failed:", notifError);
      }

      // Save token to backend
      try {
        const authToken = Cookies.get("token");
        const response = await axios.post(
          `${backend_url}/api/notifications/save-token`,
          { token: currentToken }
        );
        if(response.status === 200) {
          console.log("Token saved successfully to backend");
        }

        console.log(response);
      } catch (backendError) {
        console.error("Failed to save token to backend:", backendError);
      }

      return currentToken;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
    return null;
  }
};

export default FCMToken;
