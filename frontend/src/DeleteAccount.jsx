import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "./utils/backend";
import { StorageService } from "./utils/storage";
import { ThemeContext } from "./ThemeContext";
import { auth } from "./firebase";
import { deleteUser, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme } = useContext(ThemeContext);

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "100vw",
      backgroundColor: "rgba(10, 7, 21, 0.72)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      animation: "fadeIn 0.2s ease-out",
    },

    title: {
      fontSize: "28px",
      fontWeight: "600",
      color: "var(--error)",
      marginBottom: "10px",
      letterSpacing: "var(--tracking-tight)",
      fontFamily: "var(--font-display)",
    },

    message: {
      fontSize: "15px",
      color: "var(--text-secondary)",
      marginBottom: "20px",
      lineHeight: "1.6",
      fontWeight: "400",
      fontFamily: "var(--font-body)",
    },

    warning: {
      backgroundColor: "var(--error-soft)",
      border: "1px solid rgba(239, 108, 108, 0.35)",
      borderRadius: "var(--r-md)",
      padding: "14px 16px",
      marginBottom: "22px",
      fontSize: "13.5px",
      color: "var(--error)",
      fontWeight: "500",
      fontFamily: "var(--font-body)",
      letterSpacing: "var(--tracking-wide)",
    },

    inputGroup: {
      marginBottom: "24px",
      textAlign: "left",
    },

    label: {
      display: "block",
      fontSize: "12.5px",
      fontWeight: "600",
      color: "var(--text-secondary)",
      marginBottom: "10px",
      fontFamily: "var(--font-body)",
      letterSpacing: "var(--tracking-wider)",
      textTransform: "uppercase",
    },

    input: {
      width: "100%",
      padding: "13px 16px",
      border: "1px solid var(--border-soft)",
      borderRadius: "var(--r-md)",
      fontSize: "15px",
      transition: "all var(--dur-fast) var(--ease-out)",
      backgroundColor: "var(--bg-glass)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      boxSizing: "border-box",
      outline: "none",
    },

    buttonContainer: {
      display: "flex",
      gap: "12px",
      marginTop: "24px",
    },

    deleteBtn: {
      flex: 1,
      backgroundColor: "var(--error)",
      color: "#FBF1DE",
      border: "1px solid var(--error)",
      padding: "13px 24px",
      borderRadius: "var(--r-full)",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      letterSpacing: "var(--tracking-wide)",
      fontFamily: "var(--font-body)",
      transition: "all var(--dur-fast) var(--ease-out)",
      boxShadow: "var(--shadow-md)",
    },

    cancelBtn: {
      flex: 1,
      backgroundColor: "transparent",
      color: "var(--text-body)",
      border: "1px solid var(--border-soft)",
      padding: "13px 24px",
      borderRadius: "var(--r-full)",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      letterSpacing: "var(--tracking-wide)",
      fontFamily: "var(--font-body)",
      transition: "all var(--dur-fast) var(--ease-out)",
    },

    disabledBtn: {
      opacity: 0.55,
      cursor: "not-allowed",
      filter: "grayscale(0.3)",
    },

    forgotPasswordLink: {
      fontSize: "13px",
      color: "var(--gold-bright)",
      textDecoration: "none",
      cursor: "pointer",
      marginTop: "10px",
      display: "inline-block",
      transition: "color var(--dur-fast) var(--ease-out)",
      fontFamily: "var(--font-body)",
    },
  };

  // Add CSS animations to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .modal {
        padding: 36px 32px;
        border-radius: var(--r-2xl);
        width: 460px;
        max-width: 90vw;
        text-align: center;
        position: relative;
        animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        transition: all var(--dur-med) var(--ease-out);
        font-family: var(--font-body);
        background: var(--grad-glass);
        backdrop-filter: blur(28px) saturate(140%);
        -webkit-backdrop-filter: blur(28px) saturate(140%);
        border: 1px solid var(--border-soft);
        color: var(--text-body);
        box-shadow: var(--shadow-lg), var(--glow-gold), inset 0 1px 0 rgba(255,255,255,0.05);
      }

      .modal.light,
      .modal.dark {
        background: var(--grad-glass);
        color: var(--text-body);
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-lg), var(--glow-gold), inset 0 1px 0 rgba(255,255,255,0.05);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .delete-btn:hover:not(:disabled) {
        filter: brightness(1.08) !important;
        transform: translateY(-1px) !important;
        box-shadow: var(--shadow-lg), 0 0 30px rgba(239, 108, 108, 0.35) !important;
      }

      .cancel-btn:hover:not(:disabled) {
        color: var(--gold-bright) !important;
        border-color: var(--border-strong) !important;
        background: rgba(245, 200, 120, 0.06) !important;
        transform: translateY(-1px) !important;
      }

      .delete-btn:active:not(:disabled),
      .cancel-btn:active:not(:disabled) {
        transform: translateY(0) !important;
      }

      .password-input::placeholder {
        color: var(--text-muted) !important;
      }
      .password-input:focus {
        outline: none !important;
        border-color: var(--gold) !important;
        box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.18) !important;
        background: var(--bg-glass-hover) !important;
      }

      .forgot-password-link:hover {
        color: var(--gold) !important;
        text-decoration: underline !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleForgotPassword = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        toast.error("No user logged in or email not found");
        return;
      }

      await sendPasswordResetEmail(auth, currentUser.email);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage = error.code === 'auth/too-many-requests'
        ? "Too many requests. Please try again later."
        : "Failed to send password reset email. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast.error("Please enter your password to confirm account deletion");
      return;
    }

    setIsDeleting(true);

    try {
      // Step 1: Get current user and verify they're logged in
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        toast.error("No user logged in");
        setIsDeleting(false);
        return;
      }

      // Step 2: Reauthenticate with password BEFORE any deletion
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      try {
        await reauthenticateWithCredential(currentUser, credential);
      } catch (authError) {
        console.error("Reauthentication error:", authError);
        const errorMessage = authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential'
          ? "Incorrect password. Please try again."
          : "Failed to verify password. Please try again.";
        toast.error(errorMessage);
        setIsDeleting(false);
        return;
      }

      // Step 3: Delete Firebase user (reauthentication succeeded)
      try {
        await deleteUser(currentUser);
      } catch (firebaseError) {
        console.error("Firebase deletion error:", firebaseError);
        toast.error("Failed to delete Firebase account. Please try again.");
        setIsDeleting(false);
        return;
      }

      // Step 4: Delete MongoDB user
      const token = await StorageService.get("token");
      try {
        await axios.post(
          `${backend_url}/api/auth/delete-account`,
          { password },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (backendError) {
        console.error("Backend deletion error:", backendError);
        // Continue with cleanup even if backend fails (Firebase user already deleted)
        console.warn("Firebase user deleted but MongoDB cleanup may have failed");
      }

      // Clear local storage
      try {
        // Try StorageService first (handles Capacitor Preferences and Cookies)
        if (StorageService?.clear) {
          await StorageService.clear();
        }
        // Also clear browser storage as fallback
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.error("Storage cleanup error:", storageError);
        // Ensure storage is cleared even if StorageService fails
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (fallbackError) {
          console.error("Fallback storage cleanup error:", fallbackError);
        }
      }

      delete axios.defaults.headers.common["Authorization"];

      toast.success("Account deleted successfully");
      navigate("/login", { replace: true });

    } catch (error) {
      console.error("Delete account error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDeleting]);

  // Handle Enter key for form submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isDeleting) {
      handleDeleteAccount();
    }
  };

  return (
    <>
      {showModal && (
        <div style={styles.overlay}>
          <div className={`modal ${theme}`}>
            <h2 style={styles.title}>⚠️ Delete Account</h2>

            <p style={styles.message}>
              This action is permanent and cannot be undone. All your data will be permanently deleted.
            </p>

            <div style={styles.warning}>
              ⚠️ Warning: This will permanently delete your account and all associated data
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="password">
                Enter your password to confirm:
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                style={styles.input}
                className="password-input"
                disabled={isDeleting}
                autoFocus
              />
              <span
                onClick={handleForgotPassword}
                style={styles.forgotPasswordLink}
                className="forgot-password-link"
              >
                Forgot password?
              </span>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonContainer}>
              <button
                onClick={handleCancel}
                style={styles.cancelBtn}
                className="cancel-btn"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{
                  ...styles.deleteBtn,
                  ...(isDeleting ? styles.disabledBtn : {})
                }}
                className="delete-btn"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccount;
