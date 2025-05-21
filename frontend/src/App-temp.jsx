"use client";

// Line 3-4: Update imports
import { FaMicrophone, FaShareAlt, FaTrash, FaSpinner, FaDharmachakra, FaMoon, FaSun, FaStar } from "react-icons/fa";
import React, { useState, useEffect,useRef, createContext, useReducer } from "react";
import { FaRegPaperPlane, FaOm, FaBookOpen, FaHeart } from "react-icons/fa";
import jsPDF from 'jspdf';
import axios from 'axios';
import { FaEdit } from "react-icons/fa";
import { getStyles } from "./utils/styleExport";

const REACT_APP_API_URL = "https://geetagt-2.onrender.com";


const BhagavadGitaBot = () => {
  // Helper function for timestamp formatting (around line 14-15)
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' | ' + date.toLocaleDateString();
  };

  const handleShare = async (chatId) => {
    try {
      console.log("Chat ID being shared:", chatId);
      const res = await axios.get(`${REACT_APP_API_URL}/api/share/${chatId}`);
      const shareText = res.data.shareText;
  
      if (navigator.share) {
        navigator.share({
          title: "Bhagavad Gita Wisdom",
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing chat:", error);
    }
  };
  // Add a new state for tracking which chat is being edited
const [editingChatId, setEditingChatId] = useState(null);
const [editText, setEditText] = useState("");

// Function to handle starting the edit process
const handleEditChat = (index, message) => {
  setEditingChatId(index);
  setEditText(message);
};

// Function to cancel editing
const handleCancelEdit = () => {
  setEditingChatId(null);
  setEditText("");
};

// Function to save edits and regenerate response
const handleSaveEdit = async (index) => {
  if (!editText.trim()) return;
  setLoading(true);
  
  try {
    // Get the chat to update
    const chatToUpdate = chats[index];
    
    // Create a new request with the edited message
    const res = await axios.post(`${REACT_APP_API_URL}/api/message`, {
      message: editText,
      // Make sure we're sending the right chat history
      // Only include chats that come before the current one being edited
      chatHistory: chats.slice(0, index),
    });
    
    if (!res?.data) {
      throw new Error("No response data received");
    }
    
    // Create updated chat object
    const updatedChat = {
      ...chatToUpdate,
      userMessage: editText,
      botResponse: res.data.botResponse,
      hindiResponse: res.data.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है",
      shloka: res.data.shloka || "",
      translation: res.data.translation || "",
      chapter: res.data.chapter || "",
      verse: res.data.verse || "",
      updatedAt: new Date(),
    };
    
    // Update the chats array
    const newChats = [...chats];
    newChats[index] = updatedChat;
    
    // Remove all chats that come after this one since the context has changed
    const truncatedChats = newChats;
    setChats(truncatedChats);
    
    // Update in favorites if present
    if (favorites && favorites.length > 0) {
      const favIndex = favorites.findIndex(fav => 
        (fav._id && chatToUpdate._id && fav._id === chatToUpdate._id) || 
        fav.userMessage === chatToUpdate.userMessage
      );
      
      if (favIndex !== -1) {
        const newFavorites = [...favorites];
        newFavorites[favIndex] = updatedChat;
        setFavorites(newFavorites);
      }
    }
    
    // Clear editing state
    setEditingChatId(null);
    setEditText("");
    
  } catch (error) {
    console.error("Error updating chat:", error);
    alert(`Failed to update the chat: ${error.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
};
const SideNavigation = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  return (
    <>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: isOpen ? '0' : '-280px',
        top: '0',
        height: '100vh',
        width: '280px',
        backgroundColor: theme === "light" ? 'rgba(255, 248, 220, 0.95)' : 'rgba(40, 40, 40, 0.95)',
        borderRight: theme === "light" ? '3px solid #D4A017' : '3px solid #664D00',
        boxShadow: '3px 0 10px rgba(0, 0, 0, 0.2)',
        transition: 'left 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            right: '-50px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '100px',
            backgroundColor: theme === "light" ? '#8B0000' : '#B22222',
            color: 'white',
            border: 'none',
            borderTopRightRadius: '10px',
            borderBottomRightRadius: '10px',
            cursor: 'pointer',
            zIndex: 1100,
          }}
        >
          ←
        </button>

        <div style={{ padding: '15px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: theme === "light" ? '#8B0000' : '#FF6B6B' }}>
            Conversation History
          </h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {chats.length === 0 ? (
            <p style={{ textAlign: 'center', fontStyle: 'italic' }}>No conversations yet</p>
          ) : (
            chats.map((chat, index) => (
              <div
                key={chat._id || index}
                onClick={() => {
                  scrollToChat(index);
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setIsOpen(false);
                  }
                }}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #ccc',
                  cursor: 'pointer',
                  color: theme === "light" ? '#333' : '#E6C99D',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {index + 1}. {chat.userMessage?.substring(0, 25) || 'Untitled'}
                  {chat.userMessage?.length > 25 ? '...' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            backgroundColor: theme === "light" ? '#8B0000' : '#B22222',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: 1100,
          }}
        >
          ☰
        </button>
      )}
    </>
  );
};

  
  
  const handleDeleteSelected = async () => {
  if (Object.keys(selectedChats).length === 0) {
    alert("Please select at least one chat to delete");
    return;
  }
  
  // Confirm deletion
  const confirmDelete = window.confirm(`Are you sure you want to delete ${Object.keys(selectedChats).length} selected chat(s)?`);
  if (!confirmDelete) return;
  
  setLoading(true);
  
  try {
    // Create an array of chat IDs to delete
    const chatIdsToDelete = Object.keys(selectedChats)
      .filter(key => selectedChats[key])
      .map(key => {
        // Determine if key is a chat ID or an index
        const isIndex = !isNaN(Number(key));
        return isIndex ? chats[Number(key)]?._id : key;
      })
      .filter(id => id); // Filter out undefined IDs
    
    // Process deletions one by one
    for (const chatId of chatIdsToDelete) {
      try {
        // Delete the chat by ID
        await axios.delete(`${REACT_APP_API_URL}/api/chats/${chatId}`);
      } catch (error) {
        console.error(`Error deleting chat with ID ${chatId}:`, error);
      }
    }
    
    // Update local state by filtering out deleted chats
    setChats(prevChats => 
      prevChats.filter((chat, index) => !selectedChats[chat._id || index])
    );
    
    // Also update favorites if any deleted chats were favorites
    setFavorites(prevFavorites => 
      prevFavorites.filter(fav => 
        !chatIdsToDelete.includes(fav._id)
      )
    );
    
    // Clear selection mode and selected chats
    setSelectMode(false);
    setSelectedChats({});
    
    // Adjust visible chats if needed
    if (visibleChats > chats.length - Object.keys(selectedChats).length) {
      setVisibleChats(Math.max(1, chats.length - Object.keys(selectedChats).length));
    }
    
    alert(`Successfully deleted ${Object.keys(selectedChats).length} chat(s)`);
  } catch (error) {
    console.error("Error deleting selected chats:", error);
    alert(`Error deleting chats: ${error.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
};
  const chatRefs = useRef({});

  const scrollToChat = (index) => {
    // If the requested chat is beyond what's visible, load more chats first
    if (index >= visibleChats) {
      setVisibleChats(index + 1); // Set visible chats to include the requested index
    }
    
    // Use setTimeout to ensure the DOM has updated after state change
    setTimeout(() => {
      if (chatRefs.current[index]) {
        // Scroll to chat with a bit of offset from the top for better visibility
        window.scrollTo({
          top: chatRefs.current[index].offsetTop - 100,
          behavior: 'smooth',
        });
        
        // Highlight the chat bubble briefly
        const element = chatRefs.current[index];
        const originalBg = element.style.backgroundColor;
        const originalBorder = element.style.borderLeft;
        
        // Apply highlight styling
        element.style.backgroundColor = theme === "light" ? '#FFF0CC' : '#3D3D3D';
        element.style.borderLeft = `6px solid ${theme === "light" ? '#B8860B' : '#CD853F'}`;
        
        // Remove highlight after a delay
        setTimeout(() => {
          element.style.backgroundColor = originalBg;
          element.style.borderLeft = originalBorder;
        }, 1500);
      }
    }, 100); // Small delay to ensure DOM update
  };
  

  
  const handleExportPDF = (chatId) => {
    try {
      const chatToExport = chats.find(chat => chat._id === chatId) || 
                           (typeof chatId === 'number' ? chats[chatId] : null);
  
      if (!chatToExport) {
        console.error("Chat not found for export");
        return;
      }
  
      const doc = new jsPDF();
  
      // Title
      doc.setFontSize(22);
      doc.setFont("times", "bold");
      doc.setTextColor(139, 0, 0);
      doc.text("Divine Wisdom: Bhagavad Gita", 105, 20, { align: "center" });
  
      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(139, 69, 19);
      doc.text("Collection of Wisdom", 105, 30, { align: "center" });
  
      // Decorative line
      doc.setLineWidth(0.8);
      doc.setDrawColor(184, 134, 11);
      doc.line(20, 35, 190, 35);
  
      let currentY = 42;
  
      // Date and Time
      const date = new Date(chatToExport.createdAt);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${date.toLocaleDateString()} | Time: ${date.toLocaleTimeString()}`, 20, currentY);
      currentY += 10;
  
      // User Question
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 0);
      doc.setFont("times", "bold");
      doc.text("Your Question:", 20, currentY);
      currentY += 7;
  
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const splitQuestion = doc.splitTextToSize(chatToExport.userMessage, 170);
      doc.text(splitQuestion, 20, currentY);
      currentY += splitQuestion.length * 6 + 10;
  
      // Bot Response
      doc.setFont("times", "bold");
      doc.setTextColor(139, 69, 19);
      doc.setFontSize(14);
      doc.text("Divine Guidance:", 20, currentY);
      currentY += 7;
  
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const splitResponse = doc.splitTextToSize(chatToExport.botResponse, 170);
      doc.text(splitResponse, 20, currentY);
      currentY += splitResponse.length * 6;
  
      // Decorative line abo</div>ve footer
doc.setLineWidth(0.8);
doc.setDrawColor(184, 134, 11); // Golden color
doc.line(20, 275, 190, 275);

      // Foot</div>er
      doc.setFontSize(10);
      doc.setTextColor(102, 51, 0);
      doc.text("Generated from Bhagavad Gita Bot", 105, 280, { align: "center" });
  
      // Save PDF
      doc.save(`BhagavadGita_Wisdom_${Date.now()}.pdf`);
  
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Could not export to PDF. Please try again.");
    }
  };
  
  
  // FRONTEND: Updated delete function that aligns with the backend
// FRONTEND: Improved delete function that properly handles state

const handleDeleteChat = async (index) => {
  try {
    // Get the chat ID first
    const chatToDelete = chats[index];
    
    if (!chatToDelete || !chatToDelete._id) {
      console.error("Cannot delete chat: Invalid chat or missing ID");
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    // Send the delete request to the backend using the chat ID (preferred)
    const response = await axios.delete(`${REACT_APP_API_URL}/api/chats/${chatToDelete._id}`);
    
    // Check if deletion was successful
    if (response.data.success) {
      // Update chats state - create a new array without the deleted chat
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatToDelete._id));
      
      // Also update favorites if the deleted chat was a favorite
      setFavorites(prevFavorites => 
        prevFavorites.filter(fav => fav._id !== chatToDelete._id)
      );
      
      // Adjust visible chats if needed
      if (visibleChats > chats.length - 1) {
        setVisibleChats(Math.max(1, chats.length - 1));
      }
      
      console.log("Chat deleted successfully");
    } else {
      console.error("Backend reported delete failure:", response.data);
      alert("Failed to delete the chat. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting chat:", error);
    
    // If using chatId fails, try the index-based endpoint as fallback
    try {
      const fallbackResponse = await axios.delete(`${REACT_APP_API_URL}/api/chats/index/${index}`);
      
      if (fallbackResponse.data.success) {
        // Refresh chats from server to ensure synchronization
        const refreshedChats = await axios.get(`${REACT_APP_API_URL}/api/chats`);
        setChats(refreshedChats.data);
        console.log("Chat deleted successfully (fallback method)");
      } else {
        alert("Failed to delete the chat. Please try again.");
      }
    } catch (fallbackError) {
      console.error("Fallback delete also failed:", fallbackError);
      alert(`Error deleting chat: ${error.message || "Unknown error"}`);
    }
  } finally {
    setLoading(false);
  }
};
const handleShareSelected = async () => {
  try {
    // Filter selected chats
    const chatsToShare = chats.filter((chat, index) => selectedChats[chat._id || index]);
    
    if (chatsToShare.length === 0) {
      alert("Please select at least one chat to share");
      return;
    }
    
    // Prepare the text content to share
    let shareText = "Divine Wisdom from Bhagavad Gita:\n\n";
    
    chatsToShare.forEach((chat, i) => {
      shareText += `Q: ${chat.userMessage}\n`;
      shareText += `A: ${chat.botResponse}\n`;
      if (chat.shloka) {
        shareText += `Verse: ${chat.shloka}\n`;
        if (chat.chapter && chat.verse) {
          shareText += `— Bhagavad Gita, Chapter ${chat.chapter}, Verse ${chat.verse}\n`;
        }
        if (chat.translation) {
          shareText += `"${chat.translation}"\n`;
        }
      }
      shareText += "\n---\n\n";
    });
    
    if (navigator.share) {
      navigator.share({
        title: "Bhagavad Gita Wisdom Collection",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Multiple chats copied to clipboard!");
    }
    
    // Clear selections after sharing
    setSelectedChats({});
    setSelectMode(false);
  } catch (error) {
    console.error("Error sharing selected chats:", error);
  }
};

const toggleSelectAll = () => {
  if (Object.keys(selectedChats).length === chats.length) {
    // If all are selected, unselect all
    setSelectedChats({});
  } else {
    // Select all
    const allSelected = {};
    chats.forEach((chat, index) => {
      allSelected[chat._id || index] = true;
    });
    setSelectedChats(allSelected);
  }
};
  // Line 45-50: Add new state variables
  // Around line 48-50 (state variables)

  const [showFavorites, setShowFavorites] = useState(false);
  const [visibleChats, setVisibleChats] = useState(3);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const [favorites, setFavorites] = useState([]);
  //const [responseLanguage, setResponseLanguage] = useState("english");
  const [chatLanguages, setChatLanguages] = useState({});
  const [selectedChats, setSelectedChats] = useState({});
  const [selectMode, setSelectMode] = useState(false);
  
  // Add ref for auto-scrolling
  const messagesEndRef = useRef(null);
  useEffect(() => {
  
    alert("CALLED")
    axios.get(`${REACT_APP_API_URL}/api/chats`).then((res) => {setChats(res.data); alert("DONE")})
    .catch((err)=>{
      alert(err)
    })
    ;
    getRandomQuote();
  }, []);

  // Add new useEffect for auto-scrolling (line 65)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);
// Add local storage functionality - save chats when they change
useEffect(() => {
  if (chats.length > 0) {
    localStorage.setItem('bhagavadGitaChats', JSON.stringify(chats));
  }
}, [chats]);

// Add local storage functionality - save favorites when they change
useEffect(() => {
  if (favorites.length > 0) {
    localStorage.setItem('bhagavadGitaFavorites', JSON.stringify(favorites));
  }
}, [favorites]);

// Load chats and favorites from local storage on component mount
// Load chats, favorites and language preferences from local storage on component mount
useEffect(() => {
  const savedChats = localStorage.getItem('bhagavadGitaChats');
  const savedFavorites = localStorage.getItem('bhagavadGitaFavorites');
  const savedLanguages = localStorage.getItem('bhagavadGitaLanguages');
  
  if (savedChats) {
    setChats(JSON.parse(savedChats));
  }
  
  if (savedFavorites) {
    setFavorites(JSON.parse(savedFavorites));
  }
  
  if (savedLanguages) {
    setChatLanguages(JSON.parse(savedLanguages));
  }
}, []);

// Save language preferences when they change
useEffect(() => {
  if (Object.keys(chatLanguages).length > 0) {
    localStorage.setItem('bhagavadGitaLanguages', JSON.stringify(chatLanguages));
  }
}, [chatLanguages]);
  const loadMoreChats = () => {
    setVisibleChats(prevVisibleChats => prevVisibleChats + 3);
  };

  const getRandomQuote = () => {
    const vedicQuotes = [
  "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन॥ - BG 2.47",
  "योगः कर्मसु कौशलम्॥ - BG 2.50",
  "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज॥ - BG 18.66",
  "विद्या विनय संपन्ने ब्राह्मणे गवि हस्तिनि॥ - BG 5.18",
  "न हि कश्चित्क्षणमपि जातु तिष्ठत्यकर्मकृत्॥ - BG 3.5",
  "उद्धरेदात्मनाऽत्मानं नात्मानमवसादयेत्॥ - BG 6.5",
  "मन: प्रसाद: सौम्यत्वं मौनमात्मविनिग्रह:॥ - BG 17.16",
  "ज्ञानेन तु तदज्ञानं येषां नाशितमात्मन:॥ - BG 5.16",
  "न त्वेवाहं जातु नासं न त्वं नेमे जनाधिपा:॥ - BG 2.12",
  "श्रीभगवानुवाच: समये मृत्यु: च य: स्मरन् मम एव एष्यति॥ - BG 8.5"
];

    setCurrentQuote(vedicQuotes[Math.floor(Math.random() * vedicQuotes.length)]);
  };
  
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice input. Please use Chrome.");
      return;
    }
  
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();
    setIsListening(true);
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
  
    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event);
      setIsListening(false);
    };
  
    recognition.onend = () => {
      setIsListening(false);
    };
  };
  
  // Update handleSubmit with skeleton loading (around line 115)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    setLoading(true);
    setShowSkeleton(true);
    
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/api/message`, {
        message: input,
        chatHistory: chats.slice(0, 5),
      });
  
      setChats([
        {
          userMessage: input,
          botResponse: res?.data.botResponse,
          hindiResponse: res?.data.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है", // Default Hindi message if not available
          shloka: res?.data.shloka,
          translation: res?.data.translation,
          chapter: res?.data.chapter,
          verse: res?.data.verse,
          createdAt: new Date(),
        },
        ...chats,
      ]);
  
      getRandomQuote();
      setInput("");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
    setShowSkeleton(false);
  };
  
  
  // Updated styles with theme and font size support (line 146 onwards)
  
  const [styles, setStyles] = useState(getStyles(theme,fontSize, isOpen, isListening));
  useEffect(()=>{
    setStyles(getStyles(theme,fontSize, isOpen, isListening))
  },[theme,fontSize, isOpen, isListening])
  return (
    <div>
<SideNavigation 
  chats={chats} 
  scrollToChat={scrollToChat} 
  theme={theme} // Pass theme prop
/>
    {/* <div style={styles.paper
    } */}
    
    <div style={styles.container}>
      <div style={styles.paper}>
        <h1 style={styles.title}>
          <FaOm size={36} color="#8B0000" /> Divine Wisdom: Bhagavad Gita
        </h1>
        <p style={styles.subtitle}>Seek timeless guidance from Lord Krishna's teachings</p>

        <div style={styles.geetaQuote}>{currentQuote}</div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <button
            type="button"
            onClick={handleVoiceInput}
            style={styles.voiceButton}
            title="Speak your question"
          >
            <FaMicrophone />
          </button>

          <FaBookOpen size={22} style={styles.bookIcon} />
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Ask a question about life, dharma, karma, or purpose..."
  disabled={loading}
  style={styles.input}
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      setInput('');
    }
  }}
/>
<button type="submit" disabled={loading} style={styles.submitButton}>
  {loading ? (
    <>Contemplating... <FaDharmachakra style={{animation: "spin 2s linear infinite"}} /></>
  ) : (
    <>Ask Krishna <FaRegPaperPlane /></>
  )}
</button>
        </form>
        <div style={styles.preferencesBar}>
  <button 
    onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
    style={styles.preferencesButton}
    title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
  >
    {theme === "light" ? <FaMoon /> : <FaSun />}
  </button>
  
  <div style={styles.fontSizeControls}>
    <button 
  onClick={() => setFontSize("small")} 
  style={{
    ...styles.fontButton,
    backgroundColor: fontSize === "small" ? "#8B0000" : "#B8860B",
    fontSize: "0.8rem"
  }}
  title="Small Font"
>
  A
</button>

<button 
  onClick={() => setFontSize("medium")} 
  style={{
    ...styles.fontButton,
    backgroundColor: fontSize === "medium" ? "#8B0000" : "#B8860B",
    fontSize: "1.2rem"
  }}
  title="Medium Font"
>
  A
</button>

<button 
  onClick={() => setFontSize("large")} 
  style={{
    ...styles.fontButton,
    backgroundColor: fontSize === "large" ? "#8B0000" : "#B8860B",
    fontSize: "1.6rem"
  }}
  title="Large Font"
>
  A
</button>

  </div>
</div>
{showSkeleton && (
  <div style={styles.skeletonChatBubble}>
    <div style={styles.skeletonShortText}></div>
    <div style={styles.skeletonText}></div>
    <div style={styles.skeletonText}></div>
    <div style={styles.skeletonText}></div>
    <div style={styles.skeletonShortText}></div>
    <div ref={messagesEndRef}></div>
  </div>
)}

        <div style={styles.chatContainer}>
  {/* Header with Favorites + Select/Share buttons */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      flexWrap: 'wrap',
      gap: '10px',
    }}
  >
    {favorites.length > 0 && (
      <button
        onClick={() => setShowFavorites(!showFavorites)}
        style={styles.favoritesButton}
      >
        <FaStar /> {showFavorites ? 'Hide Favorites' : `View All Favorites (${favorites.length})`}
      </button>
    )}

    <button
      onClick={() => setSelectMode(!selectMode)}
      style={styles.smallButtonStyle}
    >
      {selectMode ? 'Cancel' : 'Select Chats'}
    </button>
  </div>

  {/* Center-aligned Select All / Share / Delete section on next line */}
  {selectMode && (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '15px',
      }}
    >
      <button onClick={toggleSelectAll} style={styles.smallButtonStyle}>
        {Object.keys(selectedChats).length === chats.length ? 'Unselect All' : 'Select All'}
      </button>

      <button
        onClick={handleShareSelected}
        style={styles.smallButtonStyle}
        disabled={Object.keys(selectedChats).length === 0}
      >
        <FaShareAlt /> Share
      </button>

      <button
        onClick={handleDeleteSelected}
        style={styles.smallButtonStyle}
        disabled={Object.keys(selectedChats).length === 0 || loading}
      >
        {loading ? (
          <FaSpinner style={{ animation: 'spin 2s linear infinite' }} />
        ) : (
          <FaTrash />
        )}{' '}
        Delete Selected
      </button>

      {Object.keys(selectedChats).length > 0 && (
        <span
          style={{
            backgroundColor: theme === 'light' ? '#FFF0CC' : '#3D3D3D',
            color: theme === 'light' ? '#8B4513' : '#CD853F',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
          }}
        >
          {Object.keys(selectedChats).length} selected
        </span>
      )}
    </div>
  )}


  {/* Favorite chats section */}
  {showFavorites && favorites.length > 0 && (
    <div style={styles.favoritesSection}>
      <h2 style={{ ...styles.subtitle, textAlign: "left", marginBottom: "1rem" }}>
        Your Favorite Wisdom
      </h2>

      {favorites.map((chat, index) => (
        <div key={`fav-${index}`} style={styles.chatBubble}>
          {selectMode && (
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        zIndex: 5
      }}>
        <input
          type="checkbox"
          checked={!!selectedChats[chat._id || `fav-${index}`]}
          onChange={() => {
            setSelectedChats(prev => ({
              ...prev,
              [chat._id || `fav-${index}`]: !prev[chat._id || `fav-${index}`]
            }));
          }}
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer'
          }}
        />
      </div>
    )}
          {/* Delete favorite */}
          <button 
            onClick={() => {
              const newFavorites = [...favorites];
              newFavorites.splice(index, 1);
              setFavorites(newFavorites);
            }} 
            style={styles.deleteButton}
            title="Remove from favorites"
          >
            <FaTrash />
          </button>


        
        <p style={{...styles.timestamp}}>
          {formatTimestamp(chat.createdAt)}
        </p>
        <p style={styles.userMessage}>
          <strong>Your Question:</strong> {chat.userMessage}
        </p>
        <p style={styles.botResponse}>
  <strong>Divine Guidance:</strong> {(chatLanguages[chat._id || `fav-${index}`] || "english") === "english" 
    ? chat.botResponse 
    : (chat.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है")}
</p>

<div style={styles.languageToggle}>
  <button 
    onClick={() => setChatLanguages(prev => ({
      ...prev,
      [chat._id || index]: "english"
    }))}
    style={{
      ...styles.languageButton,
      backgroundColor: (chatLanguages[chat._id || index] || "english") === "english" 
        ? (theme === "light" ? "#8B0000" : "#B22222") 
        : (theme === "light" ? "#B8860B" : "#CD853F"),
    }}
  >
    English
  </button>
  <button 
    onClick={() => setChatLanguages(prev => ({
      ...prev,
      [chat._id || index]: "hindi"
    }))}
    style={{
      ...styles.languageButton,
      backgroundColor: (chatLanguages[chat._id || index] || "english") === "hindi" 
        ? (theme === "light" ? "#8B0000" : "#B22222") 
        : (theme === "light" ? "#B8860B" : "#CD853F"),
    }}
  >
    हिंदी
  </button>
</div>

        {chat.shloka && (
          
          <div style={styles.shlokaContainer}>
            <p style={styles.shloka}>{chat.shloka}</p>
            {chat.chapter && chat.verse && (
              <p style={styles.verseInfo}>
              — Bhagavad Gita, Chapter {chat.chapter}, Verse {chat.verse}
            </p>
            )}
             {/* Add translation here */}
             {chat.translation && (
              <p style={styles.shlokaTranslation}>"{chat.translation}"</p>
            )}
          </div>
        )}

<div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
  {/* First Share Wisdom button */}
  <button
    onClick={() => handleShare(chat._id)}
    style={styles.shareButton}
    title="Share this wisdom"
  >
    <FaShareAlt /> Share Wisdom
  </button>
  
  {/* Export PDF button */}
  <button
    onClick={() => handleExportPDF(chat._id)}
    style={{
      ...styles.shareButton,
      backgroundColor: theme === "light" ? "#8B4513" : "#CD853F",
    }}
    title="Export as PDF"
  >
    <FaBookOpen /> Export PDF
  </button>
</div>
      </div>
    ))}
  </div>
)}
          {chats?.slice(0, visibleChats).map((chat, index) => (
  <div
  key={chat._id || index}
  style={{
    ...styles.chatBubble,
    position: 'relative',
    ...(selectedChats[chat._id || index] ? styles.selectedChatBubble : {})
  }}
  ref={el => chatRefs.current[index] = el}
>


    {selectMode && (
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        zIndex: 5
      }}>
        <input
          type="checkbox"
          checked={!!selectedChats[chat._id || index]}
          onChange={() => {
            setSelectedChats(prev => ({
              ...prev,
              [chat._id || index]: !prev[chat._id || index]
            }));
          }}
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer'
          }}
        />
      </div>
    )}
    {editingChatId === index ? (
      // Edit mode
      <div style={{ marginBottom: '10px' }}>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${theme === 'light' ? '#ccc' : '#444'}`,
            backgroundColor: theme === 'light' ? '#fff' : '#333',
            color: theme === 'light' ? '#333' : '#fff',
            minHeight: '100px',
            marginBottom: '10px'
          }}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => handleSaveEdit(index)}
            disabled={loading}
            style={{
              ...styles.shareButton,
              backgroundColor: theme === 'light' ? '#8B0000' : '#B22222'
            }}
          >
            {loading ? <FaSpinner style={{animation: "spin 2s linear infinite"}} /> : "Save"}
          </button>
          <button 
            onClick={handleCancelEdit}
            disabled={loading}
            style={{
              ...styles.shareButton,
              backgroundColor: theme === 'light' ? '#B8860B' : '#CD853F'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <>
        <button 
          onClick={() => handleDeleteChat(index)} 
          style={styles.deleteButton}
          disabled={loading}
          title="Delete this conversation"
        >
          {loading ? <FaSpinner style={{animation: "spin 2s linear infinite"}} /> : <FaTrash />}
        </button>
        <button 
          onClick={() => handleEditChat(index, chat.userMessage)} 
          style={{
            ...styles.editButton,
            color: theme === "light" ? "#8B4513" : "#CD853F"
          }}
          title="Edit your question"
        >
          <FaEdit />
        </button>

        <button 
          onClick={() => {
            const newFavorites = [...favorites];
            const index = newFavorites.findIndex(fav => fav.userMessage === chat.userMessage);
            if (index >= 0) {
              newFavorites.splice(index, 1);
            } else {
              newFavorites.push(chat);
            }
            setFavorites(newFavorites);
          }} 
          style={{
            ...styles.favoriteButton,
            color: favorites.some(fav => fav.userMessage === chat.userMessage) ? "#FFD700" : "#8B4513"
          }}
          title={favorites.some(fav => fav.userMessage === chat.userMessage) ? "Remove from favorites" : "Add to favorites"}
        >
          <FaStar />
        </button>
        <p style={{...styles.timestamp}}>
          {formatTimestamp(chat.createdAt)}
        </p>
                  
        <p style={styles.userMessage}>
          <strong>Your Question:</strong> {chat.userMessage}
        </p>
        <p style={styles.botResponse}>
          <strong>Divine Guidance:</strong> {(chatLanguages[chat._id || index] || "english") === "english" 
            ? chat.botResponse 
            : (chat.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है")}
        </p>

        <div style={styles.languageToggle}>
          <button 
            onClick={() => setChatLanguages(prev => ({
              ...prev,
              [chat._id || index]: "english"
            }))}
            style={{
              ...styles.languageButton,
              backgroundColor: (chatLanguages[chat._id || index] || "english") === "english" 
                ? (theme === "light" ? "#8B0000" : "#B22222") 
                : (theme === "light" ? "#B8860B" : "#CD853F"),
            }}
          >
            English
          </button>
          <button 
            onClick={() => setChatLanguages(prev => ({
              ...prev,
              [chat._id || index]: "hindi"
            }))}
            style={{
              ...styles.languageButton,
              backgroundColor: (chatLanguages[chat._id || index] || "english") === "hindi" 
                ? (theme === "light" ? "#8B0000" : "#B22222") 
                : (theme === "light" ? "#B8860B" : "#CD853F"),
            }}
          >
            हिंदी
          </button>
        </div>
        {chat.shloka && (
          <div style={styles.shlokaContainer}>
            <p style={styles.shloka}>{chat.shloka}</p>
            {chat.chapter && chat.verse && (
              <p style={styles.verseInfo}>
              — Bhagavad Gita, Chapter {chat.chapter}, Verse {chat.verse}
            </p>
            )}
            {/* Add translation here */}
            {chat.translation && (
              <p style={styles.shlokaTranslation}>"{chat.translation}"</p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {/* Share Wisdom button */}
          <button
            onClick={() => handleShare(chat._id)}
            style={styles.shareButton}
            title="Share this wisdom"
          >
            <FaShareAlt /> Share Wisdom
          </button>
          
          {/* Export PDF button */}
          <button
            onClick={() => handleExportPDF(chat._id)}
            style={{
              ...styles.shareButton,
              backgroundColor: theme === "light" ? "#8B4513" : "#CD853F",
            }}
            title="Export as PDF"
          >
            <FaBookOpen /> Export PDF
          </button>
        </div>
      </>
    )}
  </div>
))}


          {chats.length > visibleChats && (
            <button onClick={loadMoreChats} style={styles.viewMoreButton}>
              View More Conversations
            </button>
          )}
        </div>
        {chats.length > 0 && (
  <button 
  onClick={() => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(24);
      doc.setFont("times", "bold");
      doc.setTextColor(139, 0, 0);
      doc.text("Divine Wisdom: Bhagavad Gita", 105, 20, { align: "center" });

      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(139, 69, 19);
      doc.text("Collection of Wisdom", 105, 30, { align: "center" });

      // Top Decorative Line
      doc.setLineWidth(0.8);
      doc.setDrawColor(184, 134, 11);
      doc.line(20, 35, 190, 35);

      let currentY = 45;
      let pageNumber = 1;

      const chatsToExport = chats.slice(0, visibleChats);

      const addPageNumber = () => {
        doc.setFontSize(10);
        doc.setTextColor(102, 51, 0);
        doc.text(`Page ${pageNumber}`, 105, 287, { align: "center" });

        // Bottom Decorative Line
        doc.setLineWidth(0.8);
        doc.setDrawColor(184, 134, 11);
        doc.line(20, 275, 190, 275);
      };

      addPageNumber();

      chatsToExport.forEach((chat, index) => {
        if (currentY > 240) {
          doc.addPage();
          pageNumber++;
          currentY = 20;
          addPageNumber();
        }

        // Conversation Title
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(139, 0, 0);
        doc.text(`Conversation ${index + 1}:`, 20, currentY);
        currentY += 8;

        // Timestamp
        doc.setFontSize(10);
        doc.setFont("times", "italic");
        doc.setTextColor(102, 51, 0);
        let dateText = "Date unavailable";
        try {
          const date = new Date(chat.createdAt);
          if (!isNaN(date.getTime())) {
            dateText = `${date.toLocaleDateString()} | ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          }
        } catch (e) {
          console.error("Date parsing error:", e);
        }
        doc.text(dateText, 20, currentY);
        currentY += 10;

        // User Question
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.setTextColor(0, 100, 0);
        doc.text("Your Question:", 20, currentY);
        currentY += 7;

        doc.setFont("times", "normal");
        doc.setTextColor(0, 0, 0);
        const userMessage = chat.userMessage || "No question recorded";
        const splitQuestion = doc.splitTextToSize(userMessage, 160);
        doc.text(splitQuestion, 30, currentY);
        currentY += splitQuestion.length * 6 + 10;

        // Add new page if needed
        if (currentY > 240) {
          doc.addPage();
          pageNumber++;
          currentY = 20;
          addPageNumber();
        }

        // Bot Response
        doc.setFont("times", "bold");
        doc.setTextColor(139, 69, 19);
        doc.setFontSize(12);
        doc.text("Divine Guidance:", 20, currentY);
        currentY += 7;

        doc.setFont("times", "normal");
        doc.setTextColor(0, 0, 0);
        const botResponse = chat.botResponse || "No response available";
        const splitResponse = doc.splitTextToSize(botResponse, 160);
        doc.text(splitResponse, 30, currentY);
        currentY += splitResponse.length * 6 + 10;

        // Separator
        if (index < chatsToExport.length - 1) {
          doc.setLineWidth(0.5);
          doc.setDrawColor(184, 134, 11);
          doc.line(40, currentY, 170, currentY);
          currentY += 10;
        }

        if (currentY > 240) {
          doc.addPage();
          pageNumber++;
          currentY = 20;
          addPageNumber();
        }
      });

      // Final footer
      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.setTextColor(139, 0, 0);
      doc.text("Generated from Bhagavad Gita Bot", 105, 280, { align: "center" });

      const today = new Date();
      const dateString = today.toLocaleDateString().replace(/\//g, '-');
      doc.save(`BhagavadGita_Wisdom_${dateString}.pdf`);
    } catch (error) {
      console.error("Error exporting all chats:", error);
      alert("Could not export all conversations. Please try again.");
    }
  }} 
  style={{
    ...styles.viewMoreButton,
    backgroundColor: theme === "light" ? "#8B4513" : "#CD853F",
    marginTop: "10px"
  }}
>
  <FaBookOpen style={{ marginRight: "8px" }} /> Export All Conversations
</button>

)}
        <div style={styles.footer}>
                <p>
        <span>Made with</span> <FaHeart color="#8B0000" /> <span>and ancient wisdom.</span>
      </p>
      <p className="text-sm italic text-gray-500"><em>
  Disclaimer: This chatbot may occasionally generate incorrect information.{' '}
  <a
    href="https://ai.google.dev/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-red-700 underline"
  >
    Learn more
  </a></em>
</p>




        </div>
      </div>
    </div>
    {/* </div> */}
    </div>
  );
};

export default BhagavadGitaBot;
