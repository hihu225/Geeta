import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { StorageService } from "./utils/storage";
import { backend_url } from "./utils/backend";

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[Layout] Starting auth check...');
        
        // Debug storage contents
        await StorageService.debug();
        
        const token = await StorageService.get("token");
        console.log('[Layout] Retrieved token:', token ? 'Found' : 'Not found');

        // 🔒 Don't proceed if user had logged out previously or no token
        if (!token) {
          console.log('[Layout] No token found, setting unauthenticated');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log('[Layout] Set authorization header');
        
        // Verify token with backend
        console.log('[Layout] Verifying token with backend...');
        const response = await axios.get(`${backend_url}/api/auth/me`);
        console.log('[Layout] Backend response:', response.data);
        
        if (response.data.success) {
          console.log('[Layout] Token valid, user authenticated');
          setIsAuthenticated(true);
          try {
    
  } catch (fcmError) {
    console.error('[Layout] Error while registering FCM token:', fcmError);
  }

        } else {
          console.log('[Layout] Token invalid, cleaning up');
          // Token is invalid, clean up
          await handleAuthFailure();
        }
      } catch (error) {
        console.error('[Layout] Auth check error:', error);
        // Token verification failed, clean up
        await handleAuthFailure();
      } finally {
        setLoading(false);
      }
    };

    const handleAuthFailure = async () => {
      console.log('[Layout] Handling auth failure');
      setIsAuthenticated(false);
      await StorageService.remove("token");
      delete axios.defaults.headers.common["Authorization"];
      
      // Also clear user data from localStorage if it exists
      localStorage.removeItem("user");
    };

    checkAuth();
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
        <div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  textAlign: 'center',
}}>
  <p>Checking authentication... Please wait</p>
</div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserve current path for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children (protected routes)
  return <>{children}</>;
};

export default Layout;