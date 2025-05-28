import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { backend_url } from "./utils/backend";

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

 useEffect(() => {
  const checkAuth = async () => {
    const token = Cookies.get("token");

    // 🔒 Don't proceed if user had logged out previously
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(`${backend_url}/api/auth/me`);
      if (response.data.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        Cookies.remove("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    } catch (error) {
      setIsAuthenticated(false);
      Cookies.remove("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);


  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        Checking authentication...
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
