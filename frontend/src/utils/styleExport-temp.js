export const getStyles = (theme, fontSize, isOpen, isListening) => ({
  // Enhanced translation style with more elegant borders and spacing
  shlokaTranslation: {
    fontSize: fontSize === "small" ? "0.95rem" : fontSize === "medium" ? "1.1rem" : "1.25rem",
    color: theme === "light" ? "#3A5311" : "#9ACD32",
    lineHeight: "1.6",
    marginTop: "1rem",
    marginBottom: "0.8rem",
    fontStyle: "italic",
    borderTop: `1px solid ${theme === "light" ? "#D4A01799" : "#B8860B99"}`,
    paddingTop: "1rem",
    textShadow: theme === "light" ? "0.5px 0.5px 1px rgba(0,0,0,0.05)" : "none",
  },

  // Refined container with smoother gradients
  container: {
    minHeight: "100vh",
    width: "100dvw",
    background: theme === "light" 
      ? "linear-gradient(135deg, #FDF5E6, #F8E8C8, #F5DEB3)"
      : "linear-gradient(135deg, #2A2A2A, #1A1A1A, #121212)",
    fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Baskerville', serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0rem",
    flexDirection: "column",
    backgroundAttachment: "fixed",
    transition: "all 0.5s ease",
  },
  
  // Improved paper component with more refined shadows and borders
  paper: {
    width: "90%",
    marginLeft: isOpen ? "280px" : "0px",
    maxWidth: isOpen ? "800px" : "800px",
    padding: "3.5rem",
    borderRadius: "16px",
    backgroundColor: theme === "light" ? "rgba(255, 252, 240, 0.97)" : "rgba(40, 40, 40, 0.97)",
    border: theme === "light" ? "3px solid #D4A017" : "3px solid #664D00",
    boxShadow: theme === "light" 
      ? "0 15px 30px rgba(139, 0, 0, 0.1), 0 5px 15px rgba(139, 0, 0, 0.08)"
      : "0 15px 30px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
    transition: "all 0.3s ease",
  },

  // Refined small button with better proportions
  smallButtonStyle: {
    padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  backgroundColor: theme === "light" ? "#8B4513" : "#CD853F",  // <-- brown stays
  color: "#FFF",
  border: `1px solid ${theme === "light" ? "#D2B48C" : "#8B4513"}`,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  fontWeight: 600,
  fontFamily: "'Georgia', 'Times New Roman', serif",
  letterSpacing: "0.4px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
  transform: "translateZ(0)",
  ":hover": {
    backgroundColor: theme === "light" ? "#A0522D" : "#DE9A5A",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
  },
  },

  favoritesButton: {
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  backgroundColor: theme === "light" ? "#8B4513" : "#CD853F",  // <-- brown stays
  color: "#FFF",
  border: `1px solid ${theme === "light" ? "#D2B48C" : "#8B4513"}`,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  fontWeight: 600,
  fontFamily: "'Georgia', 'Times New Roman', serif",
  letterSpacing: "0.4px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  transform: "translateZ(0)",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.12)",
  },
},

  // Enhanced selected chat bubble with more distinct styling
  selectedChatBubble: {
    borderLeft: `6px solid ${theme === "light" ? "#8B0000" : "#B22222"}`,
    backgroundColor: theme === "light" ? 'rgba(255, 240, 205, 0.65)' : 'rgba(61, 61, 61, 0.65)',
    boxShadow: theme === "light" 
      ? "0 6px 16px rgba(139, 0, 0, 0.08)"
      : "0 6px 16px rgba(0, 0, 0, 0.15)",
  },

  // Improved checkbox container positioning
  checkboxContainer: {
    position: 'absolute',
    top: '18px',
    left: '18px',
    zIndex: 5,
  },

  // Refined checkbox style
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: theme === "light" ? "#8B0000" : "#B22222",
  },

  // Enhanced title with more elegant text styling
  title: {
    color: theme === "light" ? "#8B0000" : "#FF6B6B",
    fontWeight: "bold",
    fontSize: "2.8rem",
    textShadow: theme === "light" 
      ? "2px 2px 4px rgba(139, 0, 0, 0.15), 0 0 1px rgba(139, 0, 0, 0.1)"
      : "2px 2px 4px rgba(255, 107, 107, 0.15), 0 0 1px rgba(255, 107, 107, 0.1)",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    letterSpacing: "1px",
    fontFamily: "'Palatino Linotype', 'Book Antiqua', serif",
  },

  // Refined edit button with improved hover states
  editButton: {
    position: "absolute",
    top: "15px",
    right: "80px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: theme === "light" ? "#8B4513" : "#CD853F",
    fontSize: "1.2rem",
    padding: "6px",
    transition: "all 0.2s ease",
    opacity: "0.8",
    zIndex: 10,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
  },

  // Better structured edit form
  editForm: {
    marginTop: "0.8rem",
    marginBottom: "1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
  },

  // Enhanced edit input with better focus states
  editInput: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "8px",
    border: theme === "light" ? "2px solid #B8860B" : "2px solid #664D00",
    fontSize: fontSize === "small" ? "0.9rem" : fontSize === "medium" ? "1.1rem" : "1.3rem",
    backgroundColor: theme === "light" ? "#FFFAF0" : "#333",
    color: theme === "light" ? "#663300" : "#E6C99D",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    outline: "none",
  },

  // Better organized edit buttons container
  editButtonsContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },

  // Enhanced save button with better hover effects
  editSaveButton: {
    backgroundColor: theme === "light" ? "#006400" : "#2E8B57",
    color: "white",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    boxShadow: "0 3px 6px rgba(0,100,0,0.2)",
    transition: "all 0.2s ease",
    letterSpacing: "0.3px",
  },

  // Enhanced cancel button with better hover effects
  editCancelButton: {
    backgroundColor: theme === "light" ? "#8B0000" : "#B22222",
    color: "white",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    boxShadow: "0 3px 6px rgba(139,0,0,0.2)",
    transition: "all 0.2s ease",
    letterSpacing: "0.3px",
  },

  // Refined subtitle with better typography
  subtitle: {
    fontSize: fontSize === "small" ? "1.1rem" : fontSize === "medium" ? "1.3rem" : "1.5rem",
    color: theme === "light" ? "#663300" : "#D2B48C",
    marginBottom: "1.8rem",
    fontStyle: "italic",
    letterSpacing: "0.6px",
    fontWeight: "500",
    textShadow: theme === "light" ? "0.5px 0.5px 1px rgba(0,0,0,0.05)" : "none",
  },

  // Enhanced Geeta quote with more elegant styling
  geetaQuote: {
    fontSize: fontSize === "small" ? "1.3rem" : fontSize === "medium" ? "1.5rem" : "1.7rem",
    color: theme === "light" ? "#8B0000" : "#FF6B6B",
    fontWeight: "bold",
    margin: "1.8rem 0",
    background: theme === "light" 
      ? "linear-gradient(to right, #F9E4B7, #F7E3BC, #F9E4B7)"
      : "linear-gradient(to right, #3A3A3A, #2D2D2D, #3A3A3A)",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: theme === "light"
      ? "0 5px 10px rgba(0,0,0,0.08)"
      : "0 5px 10px rgba(0,0,0,0.15)",
    borderLeft: theme === "light" ? "5px solid #D4A017" : "5px solid #B8860B",
    textShadow: theme === "light" ? "1px 1px 2px rgba(0,0,0,0.08)" : "none",
    lineHeight: "1.6",
    letterSpacing: "0.3px",
  },

  // Better organized language toggle with improved spacing
  languageToggle: {
    display: "flex",
    justifyContent: "center",
    marginTop: "1.2rem",
    marginBottom: "1.2rem",
    gap: "10px",
  },

  // Refined language button with better hover states
  languageButton: {
    backgroundColor: theme === "light" ? "#B8860B" : "#CD853F",
    color: "white",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: fontSize === "small" ? "0.9rem" : fontSize === "medium" ? "1rem" : "1.1rem",
    fontWeight: "600",
    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
    letterSpacing: "0.3px",
  },

  // Enhanced favorites button with more elegant styling
  



  // Better defined favorites section with improved spacing
  favoritesSection: {
    marginTop: "2.8rem",
    borderTop: `2px solid ${theme === "light" ? "#D4A017" : "#B8860B"}`,
    paddingTop: "1.8rem",
  },

  // Enhanced form with better alignment and spacing
  form: {
    marginBottom: "2.8rem",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    position: "relative",
    width: "100%",
  },

  // Refined input field with better focus states
  input: {
    width: "100%",
    padding: "1rem",
    paddingLeft: "3rem",
    borderRadius: "12px",
    border: theme === "light" ? "2px solid #B8860B" : "2px solid #B8860B",
    fontSize: fontSize === "small" ? "1rem" : fontSize === "medium" ? "1.1rem" : "1.2rem",
    backgroundColor: theme === "light" ? "#FFFAF0" : "#333",
    color: theme === "light" ? "#663300" : "#E6C99D",
    fontWeight: "500",
    boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    outline: "none",
  },

  // Enhanced book icon with better positioning and animation
  bookIcon: {
    position: "absolute",
    left: "70px",
    color: isListening ? "#FF4500" : theme === "light" ? "#8B0000" : "#B22222",
    zIndex: "1",
    transition: "all 0.3s ease",
    fontSize: "1.5rem",
    transform: isListening ? "scale(1.2)" : "scale(1)",
  },

  // Enhanced submit button with better hover effects
 submitButton: {
      backgroundColor: theme === "light" ? "#8B0000" : "#B22222",
      color: "white",
      border: "none",
      padding: "0.9rem 1.8rem",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: fontSize === "small" ? "1rem" : fontSize === "medium" ? "1.1rem" : "1.2rem",
      fontWeight: "bold",
      boxShadow: "0 4px 8px rgba(139, 0, 0, 0.3)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
      letterSpacing: "0.5px",
    },

  // Enhanced voice button with better animation and hover states
  voiceButton: {
    backgroundColor: isListening ? "#FF4500" : theme === "light" ? "#8B0000" : "#B22222",
    color: "white",
    border: "none",
    padding: "1rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1.1rem",
    boxShadow: "0 5px 10px rgba(139, 0, 0, 0.25)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    transform: isListening ? "scale(1.05)" : "scale(1)",
  },

  // Enhanced view more button with better hover effects
  viewMoreButton: {
    backgroundColor: theme === "light" ? "#B8860B" : "#CD853F",
    color: "white",
    border: "none",
    padding: "0.9rem 2rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: fontSize === "small" ? "1rem" : fontSize === "medium" ? "1.1rem" : "1.2rem",
    fontWeight: "600",
    boxShadow: "0 5px 10px rgba(139, 69, 19, 0.25)",
    margin: "1.8rem auto",
    display: "block",
    transition: "all 0.2s ease",
    letterSpacing: "0.5px",
    minWidth: "180px",
  },

  // Better organized chat container with improved spacing
  chatContainer: {
    marginTop: "2.8rem",
    width: "100%",
  },

  // Enhanced delete button with better hover effects
  deleteButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: theme === "light" ? "#8B0000" : "#FF6B6B",
    fontSize: "1.2rem",
    padding: "6px",
    transition: "all 0.2s ease",
    opacity: "0.8",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
  },

  // Enhanced user message with better typography
  userMessage: {
    color: theme === "light" ? "#006400" : "#4CAF50",
    fontWeight: "600",
    marginBottom: "0.9rem",
    fontSize: fontSize === "small" ? "0.95rem" : fontSize === "medium" ? "1.15rem" : "1.35rem",
    letterSpacing: "0.2px",
  },

  // Enhanced timestamp with better typography
  timestamp: {
    fontSize: fontSize === "small" ? "0.75rem" : fontSize === "medium" ? "0.85rem" : "0.95rem",
    color: theme === "light" ? "#996633" : "#CD853F",
    marginBottom: "0.9rem",
    fontStyle: "italic",
    opacity: "0.9",
  },

  // Enhanced bot response with better typography and spacing
  botResponse: {
    color: theme === "light" ? "#8B4513" : "#D2B48C",
    marginBottom: "1.2rem",
    lineHeight: "1.7",
    fontSize: fontSize === "small" ? "0.95rem" : fontSize === "medium" ? "1.15rem" : "1.35rem",
    letterSpacing: "0.2px",
  },

  // Enhanced shloka container with more elegant styling
  shlokaContainer: {
    backgroundColor: theme === "light" ? "#FDF6E3" : "#333",
    border: theme === "light" ? "2px solid #D4A017" : "2px solid #B8860B",
    borderRadius: "12px",
    padding: "1.5rem",
    marginTop: "1.5rem",
    textAlign: "center",
    fontWeight: "bold",
    boxShadow: theme === "light" 
      ? "0 5px 12px rgba(0,0,0,0.08)"
      : "0 5px 12px rgba(0,0,0,0.15)",
  },

  // Enhanced shloka with better typography
  shloka: {
    fontSize: fontSize === "small" ? "1.15rem" : fontSize === "medium" ? "1.35rem" : "1.55rem",
    color: theme === "light" ? "#8B0000" : "#FF6B6B",
    lineHeight: "1.7",
    letterSpacing: "0.3px",
    textShadow: theme === "light" ? "0.5px 0.5px 1px rgba(0,0,0,0.05)" : "none",
  },

  // Enhanced footer with better spacing and typography
  footer: {
    marginTop: "2.5rem",
    fontSize: fontSize === "small" ? "0.85rem" : fontSize === "medium" ? "0.95rem" : "1.05rem",
    color: theme === "light" ? "#8B4513" : "#D2B48C",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    letterSpacing: "0.2px",
    opacity: "0.9",
  },

  // Enhanced preferences bar with better spacing and styling
  preferencesBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.8rem",
    padding: "1rem",
    backgroundColor: theme === "light" ? "rgba(255, 248, 220, 0.6)" : "rgba(30, 30, 30, 0.6)",
    borderRadius: "12px",
    border: `1px solid ${theme === "light" ? "#B8860B" : "#444"}`,
    boxShadow: theme === "light" 
      ? "0 3px 8px rgba(0,0,0,0.05)"
      : "0 3px 8px rgba(0,0,0,0.1)",
  },

  // Enhanced preferences button with better hover states
  preferencesButton: {
    backgroundColor: "transparent",
    color: theme === "light" ? "#8B0000" : "white",
    border: "none",
    padding: "0.7rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1.05rem",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
    boxShadow: "none",
    opacity: "0.9",
  },

  // Better organized font size controls with improved spacing
  fontSizeControls: {
    display: "flex",
    gap: "8px",
  },

  // Enhanced font button with better hover states
  fontButton: {
    backgroundColor: "transparent",
    color: theme === "light" ? "#8B0000" : "white",
    border: "none",
    padding: "0.5rem 0.7rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    fontWeight: "600",
    fontSize: index => ["0.9rem", "1.1rem", "1.3rem"][index],
    opacity: "0.9",
  },

  // Enhanced favorite button with better hover states
  favoriteButton: {
    position: "absolute",
    top: "15px",
    right: "48px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: "6px",
    transition: "all 0.2s ease",
    opacity: "0.8",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
  },

  // Enhanced spinner with smoother animation
  spinner: {
    animation: "spin 1.8s ease-in-out infinite",
  },

  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" }
  },

  // Better organized button container with improved spacing
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },

  // Enhanced chat bubble with more elegant styling
  chatBubble: {
    backgroundColor: theme === "light" ? "#FFF8DC" : "#2D2D2D",
    padding: "1.8rem",
    borderRadius: "14px",
    marginBottom: "1.8rem",
    boxShadow: theme === "light" 
      ? "0 6px 18px rgba(0,0,0,0.08)"
      : "0 6px 18px rgba(0,0,0,0.15)",
    textAlign: "left",
    position: "relative",
    borderLeft: theme === "light" ? "5px solid #B8860B" : "5px solid #CD853F",
    transition: "all 0.3s ease",
  },

  // Enhanced verse info with better typography
  verseInfo: {
    fontSize: fontSize === "small" ? "0.95rem" : fontSize === "medium" ? "1.15rem" : "1.35rem",
    color: theme === "light" ? "#8B4513" : "#D2B48C",
    marginTop: "0.7rem",
    fontStyle: "italic",
    fontFamily: "'Arial Unicode MS', 'Noto Sans', sans-serif",
    letterSpacing: "0.2px",
    opacity: "0.9",
  },

  // Enhanced share button with better hover effects
  shareButton: {
    backgroundColor: theme === "light" ? "#006400" : "#2E8B57",
    color: "white",
    border: "none",
    padding: "0.7rem 1.3rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: fontSize === "small" ? "0.95rem" : fontSize === "medium" ? "1.05rem" : "1.15rem",
    marginTop: "1.2rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 8px rgba(0,100,0,0.25)",
    transition: "all 0.2s ease",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
});