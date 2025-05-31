import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { StorageService } from "./utils/storage";
import Login from "./Login";
import Signup from "./Signup";
import BhagavadGitaBot from "./Chatbot";
import Layout from "./Layout";
import Logout from "./Logout";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ResetPassword from "./ResetPassword";
import DeleteAccount from "./DeleteAccount";
import AccountSettings from "./AccountSettings";
import { setupPushNotifications } from "./setupPushNotifications";
import { messaging, getToken, onMessage } from "./firebase";
import FCMToken from "./FCMToken";
import NotificationSettings from "./NotificationSettings";
import Notifications from "./Notifications";
// Component to handle async token checking for root route
const RootRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setupPushNotifications();
  }, []);

  useEffect(() => {
    FCMToken(); // Get and save FCM token
  }, []);

  // Set up foreground message listener
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received: ", payload);
      
      // Show notification even when app is in foreground
      if (payload.notification) {
        // Create a custom notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(
            payload.notification.title || '🕉️ Bhagavad Gita Wisdom',
            {
              body: payload.notification.body || 'New spiritual guidance available',
              icon: '/favicon.ico',
              data: payload.data
            }
          );

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Auto close after 5 seconds
          setTimeout(() => notification.close(), 5000);
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await StorageService.get("token");
        setHasToken(!!token);
      } catch (error) {
        console.error("Error checking token:", error);
        setHasToken(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return hasToken ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  useEffect(() => {
    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CLICKED') {
          // Navigate to notifications page
          window.location.href = event.data.url;
        }
      });
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          
          {/* Protected Routes wrapped in Layout */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/chat"
            element={
              <Layout>
                <BhagavadGitaBot />
              </Layout>
            }
          />

          {/* Root route with async token checking */}
          <Route path="/" element={<RootRedirect />} />
          <Route
  path="/notification-settings"
  element={
    <Layout>
      <NotificationSettings />
    </Layout>
  }
/>
          <Route
  path="/notifications"
  element={
    <Layout>
      <Notifications />
    </Layout>
  }
/>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  flexDirection: "column",
                }}
              >
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            }
          />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

const Dashboard = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to Dashboard!</h1>
      <Link to="/chat">
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          Go to Chatbot
        </button>
      </Link>
      <Link to="/logout">
        <button
          style={{ 
            padding: "10px 20px", 
            fontSize: "16px", 
            marginLeft: "10px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </Link>
      <Link to="/notification-settings">
  <button style={{ padding: "10px 20px", fontSize: "16px", marginLeft: "10px" }}>
    Notification Settings
  </button>
</Link>
    </div>
  );
};

export default App;