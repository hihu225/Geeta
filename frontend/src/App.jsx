import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Cookies from "js-cookie";

import Login from "./Login";
import Signup from "./Signup";
import BhagavadGitaBot from "./Chatbot";
import Layout from "./Layout";
import Logout from "./Logout";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ResetPassword from "./ResetPassword";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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

          {/* Redirect based on token presence */}
          <Route
            path="/"
            element={
              Cookies.get("token") ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
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
          style={{ padding: "10px 20px", fontSize: "16px", marginLeft: "10px",background: "red" }}
        >
          Logout
        </button>
      </Link>
    </div>
  );
};

export default App;
