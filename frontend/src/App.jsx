import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
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
import { UserProvider } from "./UserContext";
import { ThemeProvider } from "./ThemeContext";
import GeetaGPTLanding from './landing';
import RootRedirect from "./RootRedirect";
// Component to handle navigation-aware FCM setup
const FCMSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Expose global navigate handler for use outside React
    window.notificationNavigate = (path) => {
      requestAnimationFrame(() => {
        navigate(path);
      });
    };

    const initializeFCM = async () => {
      try {
        await FCMToken(window.notificationNavigate); // pass safe nav function
        console.log('FCM initialized with navigation');
      } catch (error) {
        console.error('FCM initialization failed:', error);
      }
    };

    initializeFCM();
  }, [navigate]);

  // Foreground message listener
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received: ", payload);

      if (payload.notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(
            payload.notification.title || '🕉️ Bhagavad Gita Wisdom',
            {
              body: payload.notification.body || 'New spiritual guidance available',
              icon: '/3.png',
              data: payload.data
            }
          );

          notification.onclick = () => {
            window.focus();
            notification.close();

            if (window.notificationNavigate) {
              window.location.href = '/notifications';

            } else {
              window.location.assign('/notifications');
            }
          };

          setTimeout(() => notification.close(), 5000);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // doesn't render anything
};


// Main App Routes component that has access to navigate
const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          // Navigate to notifications page using React Router
          navigate('/notifications');
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      // Cleanup
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [navigate]);

  return (
    <>
      {/* FCM Setup Component */}
      <FCMSetup />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/landing" element={<GeetaGPTLanding />} />
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
    </>
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

  return (
    <ThemeProvider>
    <UserProvider>
    <>
      <Router>
        <AppRoutes />
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
    </UserProvider>
    </ThemeProvider>
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
      <Link to="/notifications">
        <button style={{ 
          padding: "10px 20px", 
          fontSize: "16px", 
          marginLeft: "10px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          Notifications
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
    </div>
  );
};

export default App;