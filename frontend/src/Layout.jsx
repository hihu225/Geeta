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
      {/* Ambient background orbs */}
      <div className="loading-bg">
        <div className="loading-orb orb-1"></div>
        <div className="loading-orb orb-2"></div>
        <div className="loading-orb orb-3"></div>
      </div>

      {/* Main loading container */}
      <div className="loading-container">
        {/* Mandala spinner */}
        <div className="spinner-wrap">
          <div className="spinner-outer"></div>
          <div className="spinner-middle"></div>
          <div className="spinner-inner"></div>
          <div className="spinner-dot"></div>
        </div>

        <div className="loading-title">Connecting to Divine Wisdom</div>
        <div className="loading-sub">Preparing your spiritual journey...</div>

        <div className="loading-dots">
          {[0, 1, 2].map(i => (
            <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.16}s` }} />
          ))}
        </div>
      </div>

      <style>{`
        .fullscreen-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          flex-direction: column;
          background: var(--grad-bg);
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }

        .loading-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .loading-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 20s ease-in-out infinite;
        }
        .orb-1 {
          width: 400px; height: 400px;
          top: -100px; left: -80px;
          background: radial-gradient(circle, var(--saffron) 0%, transparent 65%);
        }
        .orb-2 {
          width: 350px; height: 350px;
          bottom: -120px; right: -60px;
          background: radial-gradient(circle, var(--lotus-deep) 0%, transparent 65%);
          animation-delay: -8s;
        }
        .orb-3 {
          width: 250px; height: 250px;
          top: 40%; right: 25%;
          background: radial-gradient(circle, var(--gold) 0%, transparent 65%);
          opacity: 0.25;
          animation-delay: -14s;
        }

        .loading-container {
          background: var(--grad-glass);
          backdrop-filter: blur(32px) saturate(140%);
          -webkit-backdrop-filter: blur(32px) saturate(140%);
          border-radius: var(--r-2xl);
          padding: 48px 44px;
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-xl), var(--glow-gold), inset 0 1px 0 rgba(255,255,255,0.06);
          text-align: center;
          z-index: 10;
          max-width: 400px;
          width: 90%;
        }

        .spinner-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          margin: 0 auto 28px;
        }
        .spinner-outer {
          position: absolute;
          inset: 0;
          border: 2.5px solid transparent;
          border-top-color: var(--gold);
          border-right-color: var(--saffron);
          border-radius: 50%;
          animation: spin 2s linear infinite;
        }
        .spinner-middle {
          position: absolute;
          top: 14px; left: 14px;
          width: 44px; height: 44px;
          border: 2px solid transparent;
          border-top-color: var(--lotus);
          border-left-color: var(--lotus-deep);
          border-radius: 50%;
          animation: spin 1.5s linear infinite reverse;
        }
        .spinner-inner {
          position: absolute;
          top: 24px; left: 24px;
          width: 24px; height: 24px;
          background: var(--grad-gold);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        .spinner-dot {
          position: absolute;
          top: 33px; left: 33px;
          width: 6px; height: 6px;
          background: var(--text-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(251, 241, 222, 0.6);
        }

        .loading-title {
          font-family: var(--font-display);
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 10px;
          letter-spacing: var(--tracking-tight);
        }
        .loading-sub {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 400;
          letter-spacing: var(--tracking-wide);
        }

        .loading-dots {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .loading-dot {
          width: 7px;
          height: 7px;
          background: var(--gold);
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 25px) scale(0.98); }
        }

        @media (max-width: 480px) {
          .loading-container {
            padding: 32px 24px;
            border-radius: var(--r-xl);
          }
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