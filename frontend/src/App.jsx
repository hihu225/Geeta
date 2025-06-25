import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation
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
import FCMToken, { 
  initializeFCMForExistingUser, 
  checkFCMTokenHealth, 
  getFCMTokenStatus 
} from "./FCMToken";
import NotificationSettings from "./NotificationSettings";
import Notifications from "./Notifications";
import { UserProvider } from "./UserContext";
import { ThemeProvider } from "./ThemeContext";
import GeetaGPTLanding from './landing';
import RootRedirect from "./RootRedirect";
import { AnimatePresence } from "framer-motion";

// Enhanced FCM Setup component with proper initialization and health checks
const FCMSetup = () => {
  const navigate = useNavigate();
  const [fcmInitialized, setFcmInitialized] = useState(false);

  // Main FCM initialization effect
  useEffect(() => {
    // Expose global navigate handler for use outside React
    window.notificationNavigate = (path) => {
      requestAnimationFrame(() => {
        navigate(path || '/notifications');
      });
    };

    const initializeFCM = async () => {
      try {
        // Check if user is logged in before initializing FCM
        const token = await StorageService.get("token");
        const userStr = localStorage.getItem("user");
        
        if (token && userStr) {
          console.log('User is logged in, initializing FCM...');
          
          // Use the enhanced initialization function
          await initializeFCMForExistingUser(window.notificationNavigate);
          setFcmInitialized(true);
          
          console.log('FCM initialized successfully with navigation');
          
          // Log FCM status for debugging
          const status = getFCMTokenStatus();
          console.log('FCM Status:', status);
        } else {
          console.log('User not logged in, skipping FCM initialization');
        }
      } catch (error) {
        console.error('FCM initialization failed:', error);
        setFcmInitialized(false);
      }
    };

    initializeFCM();
  }, [navigate]);

  // Periodic health check for FCM token
  useEffect(() => {
    if (!fcmInitialized) return;

    const healthCheckInterval = setInterval(async () => {
      try {
        const token = await StorageService.get("token");
        if (token) {
          await checkFCMTokenHealth(window.notificationNavigate);
        }
      } catch (error) {
        console.warn('FCM health check failed:', error);
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(healthCheckInterval);
  }, [fcmInitialized]);

  // Re-initialize FCM when app comes back to foreground
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && fcmInitialized) {
        try {
          const token = await StorageService.get("token");
          if (token) {
            await checkFCMTokenHealth(window.notificationNavigate);
          }
        } catch (error) {
          console.warn('FCM reinitialization on focus failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fcmInitialized]);

  // Foreground message listener with enhanced notification display
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received: ", payload);

      if (payload.notification) {
        // Use the premium notification display from FCMToken.js
        // The showPremiumNotification function will handle the display
        console.log('Foreground notification will be handled by FCMToken.js premium display');
        
        // Fallback browser notification for older devices
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(
            payload.notification.title || '🕉️ Bhagavad Gita Wisdom',
            {
              body: payload.notification.body || 'New spiritual guidance available',
              icon: '/3.png',
              data: payload.data,
              tag: 'geeta-gpt-notification', // Prevent duplicates
              renotify: false
            }
          );

          notification.onclick = () => {
            window.focus();
            notification.close();

            if (window.notificationNavigate) {
              window.notificationNavigate('/notifications');
            } else {
              window.location.href = '/notifications';
            }
          };

          // Auto-close after 5 seconds
          setTimeout(() => {
            try {
              notification.close();
            } catch (e) {
              // Notification might have been closed already
            }
          }, 5000);
        }
      }
    });

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing from FCM messages:', error);
      }
    };
  }, []);

  return null; // doesn't render anything
};

// Main App Routes component that has access to navigate
const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Service Worker message handler
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          console.log('Service Worker notification clicked, navigating to notifications');
          navigate('/notifications');
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [navigate]);

  // Handle route changes to check FCM health
  useEffect(() => {
    const checkFCMOnRouteChange = async () => {
      try {
        const token = await StorageService.get("token");
        if (token && location.pathname !== '/login' && location.pathname !== '/signup') {
          // Perform a lightweight FCM health check on route changes
          const status = getFCMTokenStatus();
          if (!status.hasToken || !status.userMatch) {
            console.log('FCM token needs refresh on route change');
            await checkFCMTokenHealth(navigate);
          }
        }
      } catch (error) {
        console.warn('FCM health check on route change failed:', error);
      }
    };

    checkFCMOnRouteChange();
  }, [location.pathname, navigate]);

  return (
    <>
      <FCMSetup />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/landing" element={<GeetaGPTLanding />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/account-settings" element={<AccountSettings />} />

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
                <Link 
                  to="/chat" 
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#4CAF50",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px"
                  }}
                >
                  Go to Chat
                </Link>
              </div>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  // Service Worker registration with enhanced error handling
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update().catch(error => {
              console.warn('Service Worker update check failed:', error);
            });
          }, 60000); // Check for updates every minute
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Global error boundary for FCM-related errors
  useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('FCM') || 
           event.error.message.includes('firebase') ||
           event.error.message.includes('messaging'))) {
        console.error('FCM-related error caught:', event.error);
        // Don't let FCM errors crash the app
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <>
          <Router>
            <AnimatePresence mode="wait">
              <AppRoutes />
            </AnimatePresence>
          </Router>
          <ToastContainer 
            position="top-right" 
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </>
      </UserProvider>
    </ThemeProvider>
  );
}

// Enhanced Dashboard component with FCM status display
const Dashboard = () => {
  const [fcmStatus, setFcmStatus] = useState(null);

  useEffect(() => {
    // Get FCM status for display
    try {
      const status = getFCMTokenStatus();
      setFcmStatus(status);
    } catch (error) {
      console.warn('Error getting FCM status:', error);
    }
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to Dashboard!</h1>
      
      {/* FCM Status Display (for debugging) */}
      {process.env.NODE_ENV === 'development' && fcmStatus && (
        <div style={{ 
          background: "#f5f5f5", 
          padding: "10px", 
          margin: "10px 0", 
          borderRadius: "4px",
          fontSize: "12px",
          textAlign: "left"
        }}>
          <strong>FCM Status (Dev Mode):</strong>
          <div>Token: {fcmStatus.hasToken ? '✅ Active' : '❌ Missing'}</div>
          <div>User Match: {fcmStatus.userMatch ? '✅ Yes' : '❌ No'}</div>
          {fcmStatus.cacheInfo.hasCache && (
            <div>Cache Age: {fcmStatus.cacheInfo.cacheAge}h</div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/chat">
          <button style={{ 
            padding: "10px 20px", 
            fontSize: "16px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Go to Chatbot
          </button>
        </Link>
        
        <Link to="/notifications">
          <button style={{ 
            padding: "10px 20px", 
            fontSize: "16px", 
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Notifications
          </button>
        </Link>
        
        <Link to="/notification-settings">
          <button style={{ 
            padding: "10px 20px", 
            fontSize: "16px", 
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Settings
          </button>
        </Link>
        
        <Link to="/logout">
          <button style={{ 
            padding: "10px 20px", 
            fontSize: "16px", 
            background: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Logout
          </button>
        </Link>
      </div>
    </div>
  );
};

export default App;