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
        
        
        // Debug storage contents
        await StorageService.debug();
        
        const token = await StorageService.get("token");
        

        // 🔒 Don't proceed if user had logged out previously or no token
        if (!token) {
          
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        
        // Verify token with backend
        
        const response = await axios.get(`${backend_url}/api/auth/me`);
        
        
        if (response.data.success) {
          
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
    <div className="fullscreen-container">
      {/* Floating particles background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)
        `,
        animation: 'float 6s ease-in-out infinite'
      }}></div>

      {/* Main loading container */}
      <div className="loading-container">
        {/* Lotus/Mandala spinner */}
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          margin: '0 auto 30px auto'
        }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            border: '3px solid transparent',
            borderTop: '3px solid #ffd700',
            borderRight: '3px solid #ff6b6b',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite'
          }}></div>
          
          {/* Middle ring */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            width: '50px',
            height: '50px',
            border: '2px solid transparent',
            borderTop: '2px solid #4ecdc4',
            borderLeft: '2px solid #45b7d1',
            borderRadius: '50%',
            animation: 'spin 1.5s linear infinite reverse'
          }}></div>
          
          {/* Inner circle */}
          <div style={{
            position: 'absolute',
            top: '25px',
            left: '25px',
            width: '30px',
            height: '30px',
            background: 'linear-gradient(45deg, #ffd700, #ff6b6b)',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite'
          }}></div>
          
          {/* Center dot */}
          <div style={{
            position: 'absolute',
            top: '37px',
            left: '37px',
            width: '6px',
            height: '6px',
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
          }}></div>
        </div>

        {/* Loading text */}
        <div style={{
          color: '#fff',
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '12px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          🕉️ Connecting to Divine Wisdom
        </div>
        
        <div style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          fontWeight: '300',
          letterSpacing: '0.5px'
        }}>
          Preparing your spiritual journey...
        </div>

        {/* Animated dots */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                background: '#ffd700',
                borderRadius: '50%',
                animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
      .fullscreen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', 'Segoe UI', sans-serif;
  position: relative;
  overflow: hidden;
  width: 100vw;
}


      .loading-container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
    z-index: 10;
    width: 100vw;
  }
  
  @media (max-width: 480px) {
    .loading-container {
      width: 100%;
      padding: 20px;
      margin: 0;
      border-radius: 0;
    }
  }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
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
  return (
    <>
      {children}
    </>
  );
};

export default Layout;