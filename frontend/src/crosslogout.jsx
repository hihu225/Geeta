import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { StorageService } from "./utils/storage";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear all stored data
        await StorageService.remove("token");
        await StorageService.remove("saved_email");
        await StorageService.remove("saved_password");
        await StorageService.remove("remember_me");
        
        // Clear localStorage data (but don't set loggedOut flag)
        localStorage.removeItem("user");
        localStorage.removeItem("loggedOut"); // Clear this flag too
        
        // Clear axios authorization header
        delete axios.defaults.headers.common["Authorization"];
        
        // Show success message
        toast.success("You've been logged out successfully! 👋");
        
        // Redirect to login page
        navigate("/login", { replace: true });
        
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Error during logout, but you've been logged out locally.");
        
        // Still redirect even if there's an error
        navigate("/login", { replace: true });
      }
    };

    handleLogout();
  }, [navigate]);

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
        borderTop: '4px solid #e74c3c',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <p>Logging out...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Logout;