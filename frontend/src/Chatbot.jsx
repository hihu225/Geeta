"use client";

import {
  FaMicrophone,
  FaShareAlt,
  FaTrash,
  FaSpinner,
  FaDharmachakra,
  FaMoon,
  FaSun,
  FaStar,
} from "react-icons/fa";
import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useReducer,
} from "react";
import { FaRegPaperPlane, FaOm, FaBookOpen, FaHeart } from "react-icons/fa";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import jsPDF from "jspdf";
import axios from "axios";
import ScrollToTop from "./ScrollToTop.jsx";
import { FaEdit } from "react-icons/fa";
import { getStyles } from "./utils/styleExport.js";
import { Share } from "@capacitor/share";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import "./hihu.css";
import ThemeNavigation from "./ThemeNavigation.jsx";
import ThemeDetails from "./ThemeDetails.jsx";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const REACT_APP_API_URL = import.meta.env.VITE_APP_API_URL;
const testApi = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/api/messages`);
    alert("API reachable. Chats count: " + res.data.length);
  } catch (err) {
    alert("Error reaching API: " + err.message);
  }
};

const addKeyframes = () => {
  const styleSheet = document.styleSheets[0];
  const keyframes = `@keyframes scrollText {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }`;

  // Insert the keyframes rule if it doesn't exist yet
  const rules = Array.from(styleSheet.cssRules).map((rule) => rule.cssText);
  if (!rules.includes(keyframes)) {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }
};

addKeyframes();

const BhagavadGitaBot = () => {
  const navigate = useNavigate();
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " | " +
      date.toLocaleDateString()
    );
  };

  const handleShare = async (chatId) => {
    try {
      console.log("Chat ID being shared:", chatId);
      const res = await axios.get(`${REACT_APP_API_URL}/api/share/${chatId}`);
      const shareText = res.data.shareText;

      await Share.share({
        title: "Bhagavad Gita Wisdom",
        text: shareText,
        dialogTitle: "Share via",
      });
    } catch (error) {
      console.error("Error sharing chat:", error);
    }
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 500, behavior: "smooth" });
  };
  const [editingChatId, setEditingChatId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showInputWrapper, setShowInputWrapper] = React.useState(true);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 400) {
        setShowInputWrapper(false);
      } else {
        setShowInputWrapper(true);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handleEditChat = (index, message) => {
    setEditingChatId(index);
    setEditText(message);
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditText("");
  };

const handleExportAllChats = async () => {
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

    // Decorative Line
    doc.setLineWidth(0.8);
    doc.setDrawColor(184, 134, 11);
    doc.line(20, 35, 190, 35);

    let currentY = 45;
    let pageNumber = 1;

    const chatsToExport = chats.slice(0, visibleChats || chats.length);

    const addPageNumber = () => {
      doc.setFontSize(10);
      doc.setTextColor(102, 51, 0);
      doc.text(`Page ${pageNumber}`, 105, 287, { align: "center" });
      doc.setLineWidth(0.8);
      doc.setDrawColor(184, 134, 11);
      doc.line(20, 275, 190, 275);
    };

    addPageNumber();

    for (let index = 0; index < chatsToExport.length; index++) {
      const chat = chatsToExport[index];

      if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
        addPageNumber();
      }

      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.setTextColor(139, 0, 0);
      doc.text(`Conversation ${index + 1}:`, 20, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.setTextColor(102, 51, 0);
      let dateText = "Date unavailable";
      try {
        const date = new Date(chat.createdAt);
        if (!isNaN(date.getTime())) {
          dateText = `${date.toLocaleDateString()} | ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
        }
      } catch (_) {}
      doc.text(dateText, 20, currentY);
      currentY += 10;

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

      if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
        addPageNumber();
      }

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
    }

    // Final Footer
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.setTextColor(139, 0, 0);
    doc.text("Generated from Bhagavad Gita Bot", 105, 280, { align: "center" });

    const today = new Date();
    const fileName = `BhagavadGita_Wisdom_${today.toLocaleDateString().replace(/\//g, "-")}.pdf`;

    if (
      Capacitor.getPlatform() === "android" ||
      Capacitor.getPlatform() === "ios"
    ) {
      const pdfOutput = doc.output("datauristring");
      const base64 = pdfOutput.split(",")[1];

      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
      });

      await Swal.fire({
        icon: 'success',
        title: 'PDF Saved!',
        text: 'Your conversation has been saved successfully in documents.',
        timer: 3000,
        showConfirmButton: false
      });

      const fileUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName,
      });

      await Swal.fire({
        icon: 'info',
        title: 'Ready to Share',
        text: 'You can now share your saved Bhagavad Gita PDF.',
        timer: 2500,
        showConfirmButton: false
      });

      await Share.share({
        title: "Share Bhagavad Gita PDF",
        text: "Here is your exported conversation from Geeta GPT",
        url: fileUri.uri,
        dialogTitle: "Share PDF",
      });
    } else {
      doc.save(fileName);
    }
  } catch (error) {
    console.error("Error exporting all chats:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Export Failed',
      text: 'Failed to save or share the PDF. Please try again.',
    });
  }
};

  const handleSaveEdit = async (index) => {
  if (!editText.trim()) return;
  setLoading(true);

  try {
    const chatToUpdate = chats[index];

    const res = await axios.post(`${REACT_APP_API_URL}/api/message`, {
      message: editText,
      chatHistory: chats.slice(0, index),
    });

    if (!res?.data) {
      throw new Error("No response data received");
    }

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

    const newChats = [...chats];
    newChats[index] = updatedChat;

    const truncatedChats = newChats;
    setChats(truncatedChats);

    if (favorites && favorites.length > 0) {
      const favIndex = favorites.findIndex(
        (fav) =>
          (fav._id && chatToUpdate._id && fav._id === chatToUpdate._id) ||
          fav.userMessage === chatToUpdate.userMessage
      );

      if (favIndex !== -1) {
        const newFavorites = [...favorites];
        newFavorites[favIndex] = updatedChat;
        setFavorites(newFavorites);
      }
    }

    setEditingChatId(null);
    setEditText("");

    await Swal.fire({
      icon: "success",
      title: "Updated",
      text: "Chat updated successfully.",
      confirmButtonColor: "#8B0000",
    });

  } catch (error) {
    console.error("Error updating chat:", error);
    await Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: error.message || "Unknown error occurred.",
      confirmButtonColor: "#8B0000",
    });
  } finally {
    setLoading(false);
  }
};

  const [isOpen, setIsOpen] = useState(false);
  const SideNavigation = ({ chats, scrollToChat, theme }) => {
    // Helper function to check screen width safely
    const checkScreenWidth = () => {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(max-width: 767px)").matches;
      }
      return false; // default fallback
    };

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      if (typeof window !== "undefined") {
        window.addEventListener("keydown", handleKeyDown);
      }
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("keydown", handleKeyDown);
        }
      };
    }, []);
    const tap = new Audio("/knock.mp3");
    useEffect(() => {
      const handleResize = () => {
        setIsOpen(false);
      };
      if (typeof window !== "undefined") {
        window.addEventListener("resize", handleResize);
      }
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("resize", handleResize);
        }
      };
    }, []);

    return (
      <>
        {/* Sidebar Container */}
        <div style={styles.sidebar}>
          {/* Close button in top right corner */}
          <button
            onClick={() => {
              tap.play();
              setIsOpen(false);
            }}
            style={{
              position: "absolute",
              top: "6px",
              right: "15px",
              background: theme === "light" ? "#8B0000" : "#B22222",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              fontSize: "20px",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              zIndex: 1001,
            }}
          >
            ×
          </button>

          <div
            style={{
              padding: "15px",
              textAlign: "center",
              borderBottom:
                theme === "light" ? "2px solid #D4A017" : "2px solid #664D00",
            }}
          >
            <h3
              style={{
                color: theme === "light" ? "#8B0000" : "#FF6B6B",
                margin: "10px 0",
                fontSize: "1.3rem",
              }}
            >
              Conversation History
            </h3>
          </div>

          <div
            style={{
              overflow: "auto",
              padding: "15px",
              flex: 1,
            }}
          >
            {chats.length === 0 ? (
              <p
                style={{
                  color: theme === "light" ? "#8B4513" : "#D2B48C",
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                No conversations yet
              </p>
            ) : (
              chats.map((chat, index) => (
                <div
                  key={chat._id || `nav-${index}`}
                  onClick={() => {
                    tap.play();
                    scrollToChat(index);
                    if (window.innerWidth < 768) {
                      setIsOpen(false); // Close sidebar after selection on mobile
                    }
                  }}
                  style={{
                    padding: "12px 10px",
                    borderBottom:
                      theme === "light"
                        ? "1px solid #D4A01788"
                        : "1px solid #664D0088",
                    cursor: "pointer",
                    marginBottom: "5px",
                    borderRadius: "5px",
                    transition: "background-color 0.2s",
                    backgroundColor: "transparent",
                    color: theme === "light" ? "#663300" : "#E6C99D",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      theme === "light" ? "#FDF6E3" : "#3A3A3A")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {index + 1}.{" "}
                    {chat.userMessage?.substring(0, 25) || "Untitled"}
                    {chat.userMessage && chat.userMessage.length > 25
                      ? "..."
                      : ""}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: theme === "light" ? "#8B4513" : "#CD853F",
                      fontStyle: "italic",
                      marginTop: "5px",
                    }}
                  >
                    {
                      formatTimestamp(chat.createdAt || new Date()).split(
                        "|"
                      )[0]
                    }
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: "15px",
              borderTop:
                theme === "light"
                  ? "2px solid #D4A01788"
                  : "2px solid #664D0088",
              textAlign: "center",
            }}
          ></div>
        </div>

        {/* Open Sidebar Button (visible only when sidebar is closed) */}
        {!isOpen && (
          <button
            onClick={() => {
              tap.play();
              if (checkScreenWidth()) {
                setIsOpen(true);
              } else {
                setIsOpen(false);
              }
              setIsOpen(true);
            }}
            style={styles.opensidebarbutton}
          >
            Open Sidebar
          </button>
        )}
      </>
    );
  };
  

const handleDeleteSelected = async () => {
  if (Object.keys(selectedChats).length === 0) {
    await Swal.fire({
      icon: 'info',
      title: 'No chats selected',
      text: 'Please select at least one chat to delete',
    });
    return;
  }

  const confirmDelete = await Swal.fire({
    title: 'Delete Chats?',
    text: `Are you sure you want to delete ${Object.keys(selectedChats).length} selected chat(s)?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete them',
    cancelButtonText: 'Cancel'
  });

  if (!confirmDelete.isConfirmed) return;

  setLoading(true);

  try {
    const chatIdsToDelete = Object.keys(selectedChats)
      .filter((key) => selectedChats[key])
      .map((key) => {
        const isIndex = !isNaN(Number(key));
        return isIndex ? chats[Number(key)]?._id : key;
      })
      .filter((id) => id);

    for (const chatId of chatIdsToDelete) {
      try {
        await axios.delete(`${REACT_APP_API_URL}/api/chats/${chatId}`);
      } catch (error) {
        console.error(`Error deleting chat with ID ${chatId}:`, error);
      }
    }

    setChats((prevChats) =>
      prevChats.filter((chat, index) => !selectedChats[chat._id || index])
    );

    setFavorites((prevFavorites) =>
      prevFavorites.filter((fav) => !chatIdsToDelete.includes(fav._id))
    );

    setSelectMode(false);
    setSelectedChats({});

    if (visibleChats > chats.length - Object.keys(selectedChats).length) {
      setVisibleChats(Math.max(1, chats.length - Object.keys(selectedChats).length));
    }

    await Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: `${Object.keys(selectedChats).length} chat(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting selected chats:", error);
    await Swal.fire({
      icon: 'error',
      title: 'Deletion Failed',
      text: error.message || 'An unknown error occurred',
    });
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
          behavior: "smooth",
        });

        // Highlight the chat bubble briefly
        const element = chatRefs.current[index];
        const originalBg = element.style.backgroundColor;
        const originalBorder = element.style.borderLeft;

        // Apply highlight styling
        element.style.backgroundColor =
          theme === "light" ? "#FFF0CC" : "#3D3D3D";
        element.style.borderLeft = `6px solid ${
          theme === "light" ? "#B8860B" : "#CD853F"
        }`;

        // Remove highlight after a delay
        setTimeout(() => {
          element.style.backgroundColor = originalBg;
          element.style.borderLeft = originalBorder;
        }, 1500);
      }
    }, 100); // Small delay to ensure DOM update
  };

  const handleExportPDF = async (chatId) => {
  try {
    const chatToExport =
      chats.find((chat) => chat._id === chatId) ||
      (typeof chatId === "number" ? chats[chatId] : null);
    if (!chatToExport) {
      console.error("Chat not found for export");
      await Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Chat not found for export.",
        confirmButtonColor: "#8B0000",
      });
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.setTextColor(139, 0, 0);
    doc.text("Divine Wisdom: Bhagavad Gita", 105, 20, { align: "center" });

    let currentY = 42;
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Date: ${new Date(chatToExport.createdAt).toLocaleString()}`,
      20,
      currentY
    );
    currentY += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.setFont("times", "bold");
    doc.text("Your Question:", 20, currentY);
    currentY += 7;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const splitQuestion = doc.splitTextToSize(chatToExport.userMessage, 170);
    doc.text(splitQuestion, 20, currentY);
    currentY += splitQuestion.length * 6 + 10;

    doc.setFont("times", "bold");
    doc.setTextColor(139, 69, 19);
    doc.setFontSize(14);
    doc.text("Divine Guidance:", 20, currentY);
    currentY += 7;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const splitResponse = doc.splitTextToSize(chatToExport.botResponse, 170);
    doc.text(splitResponse, 20, currentY);
    currentY += splitResponse.length * 6;

    const base64 = doc.output("dataurlstring").split(",")[1];
    const fileName = `BhagavadGita_Wisdom_${Date.now()}.pdf`;

    if (
      Capacitor.getPlatform() === "android" ||
      Capacitor.getPlatform() === "ios"
    ) {
      const saved = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
      });

      await Swal.fire({
        icon: "success",
        title: "PDF Saved",
        text: "PDF saved successfully!",
        confirmButtonColor: "#8B0000",
      });

      const fileUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName,
      });

      await Swal.fire({
        icon: "success",
        title: "PDF Ready",
        text: "PDF ready to share!",
        confirmButtonColor: "#8B0000",
      });

      await Share.share({
        title: "Share Bhagavad Gita PDF",
        text: "Here is some divine wisdom from Geeta GPT",
        url: fileUri.uri,
        dialogTitle: "Share PDF",
      });
    } else {
      doc.save(fileName);
      await Swal.fire({
        icon: "success",
        title: "PDF Downloaded",
        text: "PDF has been downloaded successfully.",
        confirmButtonColor: "#8B0000",
      });
    }
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    await Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: "Failed to save or share PDF. Please try again.",
      confirmButtonColor: "#8B0000",
    });
  }
};

  const handleThemeSelect = async (themeName) => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_URL}/api/themes/${themeName}`
      );
      setThemeData(response.data);
      setSelectedTheme(themeName);
      setShowThemeSection(true);
    } catch (error) {
      console.error("Error fetching theme details:", error);
    }
  };
  const handleCloseThemeDetails = () => {
    setShowThemeSection(false);
    setSelectedTheme(null);
  };
  const handleFav = async (chat) => {
    console.log("handleFav called with chat:", chat._id);
    console.log(
      "Current favorites:",
      favorites.map((f) => f._id)
    );

    try {
      const isTempId = chat._id.length !== 24; // MongoDB ObjectId is 24 chars hex
      const isAlreadyFavorite = favorites.some((fav) => fav._id === chat._id);

      console.log("isTempId:", isTempId);
      console.log("isAlreadyFavorite:", isAlreadyFavorite);

      if (isTempId) {
        // TEMP ID: toggle favorite locally ONLY (no backend call)
        if (isAlreadyFavorite) {
          console.log("Removing temp favorite");
          setFavorites(favorites.filter((fav) => fav._id !== chat._id));
        } else {
          console.log("Adding temp favorite");
          setFavorites([...favorites, chat]);
        }
      } else {
        // PERMANENT ID: update backend
        console.log("Updating backend for permanent ID");

        const response = await axios.put(
          `${REACT_APP_API_URL}/api/chats/${chat._id}/favorite`,
          { isFavorite: !isAlreadyFavorite },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );


        const updatedChat = response.data;
        console.log("Backend response:", updatedChat);

        // Update local favorites accordingly
        if (updatedChat.isFavorite) {
          setFavorites([
            ...favorites.filter((fav) => fav._id !== chat._id),
            updatedChat,
          ]);
        } else {
          setFavorites(favorites.filter((fav) => fav._id !== chat._id));
        }
      }
    } catch (error) {
      console.error("handleFav error:", error);
    }
  };
  const handleDeleteFavoriteChat = async (chat, favoriteIndex) => {
    try {
      if (!chat || !chat._id) {
        console.error("Cannot delete chat: Invalid chat or missing ID");
        return;
      }

      // Show loading state
      setLoading(true);

      // Check if it's a temp ID or permanent ID
      const isTempId = chat._id.length !== 24;

      if (isTempId) {
        // For temp IDs, we need to either:
        // 1. Delete from backend if it exists there, OR
        // 2. Find the actual backend ID and delete that

        try {
          // Try to find the chat in backend by other identifiers (title, timestamp, etc.)
          const backendChats = await axios.get(
            `${REACT_APP_API_URL}/api/chats`
          );

          // Find matching chat by title and approximate creation time
          const matchingChat = backendChats.data.find(
            (backendChat) =>
              backendChat.title === chat.title &&
              // Add other matching criteria as needed (timestamp, first message, etc.)
              Math.abs(
                new Date(backendChat.createdAt) - new Date(chat.createdAt)
              ) < 60000 // Within 1 minute
          );

          if (matchingChat) {
            // Delete the actual backend chat
            const response = await axios.delete(
              `${REACT_APP_API_URL}/api/chats/${matchingChat._id}`
            );

            if (response.data.success) {
              deleteSound.play();
              console.log("Temp chat found and deleted from backend");

              // Remove from local state
              setFavorites((prevFavorites) =>
                prevFavorites.filter((fav) => fav._id !== chat._id)
              );
              setChats((prevChats) =>
                prevChats.filter((c) => c._id !== chat._id)
              );

              // FIX: Refresh data and get actual favorite status from backend
              const refreshedChats = await axios.get(
                `${REACT_APP_API_URL}/api/chats`
              );

              // Update chats with backend data (backend should have correct isFavorite status)
              setChats(refreshedChats.data);

              // Update favorites based on backend data
              const backendFavorites = refreshedChats.data.filter(
                (c) => c.isFavorite
              );
              setFavorites(backendFavorites);
            }
          } else {
            // If not found in backend, just remove locally (truly temporary)
            deleteSound.play();
            setFavorites((prevFavorites) =>
              prevFavorites.filter((fav) => fav._id !== chat._id)
            );
            setChats((prevChats) =>
              prevChats.filter((c) => c._id !== chat._id)
            );
            console.log("Temp chat removed from local state only");
          }
        } catch (tempError) {
          console.error("Error handling temp chat deletion:", tempError);

          // Fallback: remove from local state
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav._id !== chat._id)
          );
          setChats((prevChats) => prevChats.filter((c) => c._id !== chat._id));
        }
      } else {
        // For permanent IDs, use your existing logic
        let deleteSuccess = false;

        try {
          // Strategy 1: Delete by ID
          const response = await axios.delete(
            `${REACT_APP_API_URL}/api/chats/${chat._id}`
          );

          if (response.data.success) {
            deleteSuccess = true;
            console.log("Chat deleted successfully from backend (by ID)");
          }
        } catch (idError) {
          console.log("ID-based deletion failed, trying fallback...");

          // Strategy 2: Fallback to index-based deletion
          try {
            const chatIndex = chats.findIndex((c) => c._id === chat._id);

            if (chatIndex !== -1) {
              const fallbackResponse = await axios.delete(
                `${REACT_APP_API_URL}/api/chats/index/${chatIndex}`
              );

              if (fallbackResponse.data.success) {
                deleteSuccess = true;
                console.log("Chat deleted successfully (fallback method)");
              }
            }
          } catch (fallbackError) {
            console.error("Both deletion methods failed:", fallbackError);
          }
        }

        if (deleteSuccess) {
          deleteSound.play();

          // Wait a bit for backend to process
          await new Promise((resolve) => setTimeout(resolve, 500));

          // FIX: Refresh from server and let backend determine favorite status
          try {
            const refreshedChats = await axios.get(
              `${REACT_APP_API_URL}/api/chats`
            );

            // Use backend data as source of truth for both chats and favorites
            setChats(refreshedChats.data);

            // Update favorites based on what backend says is favorited
            const backendFavorites = refreshedChats.data.filter(
              (chat) => chat.isFavorite
            );
            setFavorites(backendFavorites);

            console.log("Data refreshed from server after deletion");
          } catch (refreshError) {
            console.error("Failed to refresh data:", refreshError);

            // Fallback: Remove locally only the deleted chat
            setChats((prevChats) =>
              prevChats.filter((c) => c._id !== chat._id)
            );
            setFavorites((prevFavorites) =>
              prevFavorites.filter((fav) => fav._id !== chat._id)
            );
          }

          // Adjust visible chats
          setVisibleChats((prev) => Math.max(1, prev - 1));
        } else {
              await Swal.fire({
                icon: "error",
                title: "Deletion Failed",
                text: "Failed to delete the chat. Please try again.",
                confirmButtonColor: "#8B0000"
              });
          }

      }
    } catch (error) {
  console.error("Error deleting favorite chat:", error);
  await Swal.fire({
    icon: "error",
    title: "Error Deleting Chat",
    text: `Error deleting chat: ${error.message || "Unknown error"}`,
    confirmButtonColor: "#8B0000"
  });
}
 finally {
      setLoading(false);
    }
  };
  const toggleSound = new Audio("/toggle.mp3");

  const deleteSound = new Audio("/delete.mp3");

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
      const response = await axios.delete(
        `${REACT_APP_API_URL}/api/chats/${chatToDelete._id}`
      );

      // Check if deletion was successful
      if (response.data.success) {
        deleteSound.play();
        // Update chats state - create a new array without the deleted chat
        setChats((prevChats) =>
          prevChats.filter((chat) => chat._id !== chatToDelete._id)
        );

        // Also update favorites if the deleted chat was a favorite
        setFavorites((prevFavorites) =>
          prevFavorites.filter((fav) => fav._id !== chatToDelete._id)
        );

        // Adjust visible chats if needed
        if (visibleChats > chats.length - 1) {
          setVisibleChats(Math.max(1, chats.length - 1));
        }

        console.log("Chat deleted successfully");
      } else {
  console.error("Backend reported delete failure:", response.data);
  await Swal.fire({
    icon: "error",
    title: "Delete Failed",
    text: "Failed to delete the chat. Please try again.",
    confirmButtonColor: "#8B0000"
  });
}

    } catch (error) {
      console.error("Error deleting chat:", error);

      // If using chatId fails, try the index-based endpoint as fallback
      try {
        const fallbackResponse = await axios.delete(
          `${REACT_APP_API_URL}/api/chats/index/${index}`
        );

        if (fallbackResponse.data.success) {
          // Refresh chats from server to ensure synchronization
          deleteSound.play();
          const refreshedChats = await axios.get(
            `${REACT_APP_API_URL}/api/chats`
          );
          setChats(refreshedChats.data);
          console.log("Chat deleted successfully (fallback method)");
        } else {
  console.error("Backend reported delete failure:", response.data);
  await Swal.fire({
    icon: "error",
    title: "Delete Failed",
    text: "Failed to delete the chat. Please try again.",
    confirmButtonColor: "#8B0000"
  });
}

      } catch (fallbackError) {
  console.error("Fallback delete also failed:", fallbackError);
  await Swal.fire({
    icon: "error",
    title: "Error Deleting Chat",
    text: fallbackError.message || "Unknown error",
    confirmButtonColor: "#8B0000"
  });
}

    } finally {
      setLoading(false);
    }
  };
  const handleShareSelected = async () => {
    try {
      // Filter selected chats
      const chatsToShare = chats.filter(
        (chat, index) => selectedChats[chat._id || index]
      );

      if (chatsToShare.length === 0) {
  await Swal.fire({
    icon: "info",
    title: "No Chats Selected",
    text: "Please select at least one chat to share",
    confirmButtonColor: "#8B0000"
  });
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

      if (Share.share) {
        Share.share({
          title: "Bhagavad Gita Wisdom Collection",
          text: shareText,
        });
      } else {
  await navigator.clipboard.writeText(shareText);
  await Swal.fire({
    icon: "success",
    title: "Copied!",
    text: "Multiple chats copied to clipboard!",
    confirmButtonColor: "#8B0000",
  });
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

  const [showFavorites, setShowFavorites] = useState(false);
  const [visibleChats, setVisibleChats] = useState(3);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("fontSize") || "medium";
  });
  const [favorites, setFavorites] = useState([]);
  //const [responseLanguage, setResponseLanguage] = useState("english");
  const [chatLanguages, setChatLanguages] = useState({});
  const [selectedChats, setSelectedChats] = useState({});
  const [selectMode, setSelectMode] = useState(false);
  const [showThemeSection, setShowThemeSection] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [themeData, setThemeData] = useState(null);

  // Add ref for auto-scrolling
  const messagesEndRef = useRef(null);
  useEffect(() => {
    axios
      .get(`${REACT_APP_API_URL}/api/chats`)
      .then((res) => {
        setChats(res.data);
      })
      .catch((err) => {
        alert(err);
      });
    getRandomQuote();
  }, []);

  // Add new useEffect for auto-scrolling (line 65)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);
  

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
      "श्रीभगवानुवाच: समये मृत्यु: च य: स्मरन् मम एव एष्यति॥ - BG 8.5",
    ];

    setCurrentQuote(
      vedicQuotes[Math.floor(Math.random() * vedicQuotes.length)]
    );
  };
  const moreSound = new Audio("/more.mp3");
  const startSound = new Audio("/start.mp3");
  const stopSound = new Audio("/end.mp3");

  stopSound.volume = 0.6;
  const recognitionRef = useRef(null);
  const handleVoiceInput = async () => {
    if (isListening) {
      // 🔴 If already listening, stop it
      if (Capacitor.isNativePlatform()) {
        SpeechRecognition.stop();
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }
    startSound.play();
    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await SpeechRecognition.checkPermissions();
        if (!permission.permissionGranted) {
          await SpeechRecognition.requestPermissions();
        }

        const available = await SpeechRecognition.available();
        if (!available) {
  await Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Speech recognition not available on this device.",
    confirmButtonColor: "#8B0000",
  });
  return;
}
        SpeechRecognition.isListening().then((result) => {
          if (result) {
            setIsListening(true);
          } else {
            setIsListening(false);
          }
        });

        const partialResultsListener = SpeechRecognition.addListener(
          "partialResults",
          (data) => {
            if (data.matches && data.matches.length > 0) {
              setInput(data.matches[0]);
            }
          }
        );

        const listeningStateListener = SpeechRecognition.addListener(
          "listeningState",
          (state) => {
            if (state.status === "stopped") {
              stopSound.play();
              setIsListening(false);
              partialResultsListener.remove();
              listeningStateListener.remove();
            }
          }
        );

        await SpeechRecognition.start({
          language: "en-IN",
          maxResults: 1,
          prompt: "Speak now...",
          partialResults: true,
        });
      } catch (error) {
        console.error("Native error:", error);
        setIsListening(false);
      }
    } else {
      try {
        const SpeechRecognitionWeb =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionWeb) {
  await Swal.fire({
    icon: "error",
    title: "Unsupported",
    text: "Speech recognition is not supported in this browser.",
    confirmButtonColor: "#8B0000",
  });
  return;
}


        const recognition = new SpeechRecognitionWeb();
        recognitionRef.current = recognition;

        recognition.lang = "en-IN";
        recognition.maxAlternatives = 1;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          setInput(event.results[0][0].transcript);
          stopSound.play();
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognition.onerror = (event) => {
          console.error("Web Speech recognition error:", event.error);
          stopSound.play();
          setIsListening(false);
          recognitionRef.current = null;
        };

        setIsListening(true);
        recognition.start();
      } catch (error) {
        console.error("Web error:", error);
        setIsListening(false);
      }
    }
  };

  const sendSound = new Audio("/send.mp3");

  const responseSound = new Audio("/received.wav");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendSound.play();
    setLoading(true);
    setShowSkeleton(true);
    const tempId = uuidv4(); // Temporary ID for new chat

    // Add chat locally immediately with tempId
    const tempChat = {
      _id: tempId,
      userMessage: input,
      botResponse: "...loading...",
      createdAt: new Date(),
    };
    setChats([tempChat, ...chats]); // Show loading chat

    try {
      const res = await axios.post(`${REACT_APP_API_URL}/api/message`, {
        message: input,
        chatHistory: chats.slice(0, 5),
      });
      responseSound.play();

      const newChat = {
        _id: res?.data.chatId || tempId,
        userMessage: input,
        botResponse: res?.data.botResponse,
        hindiResponse: res?.data.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है",
        shloka: res?.data.shloka,
        translation: res?.data.translation,
        chapter: res?.data.chapter,
        verse: res?.data.verse,
        createdAt: new Date(),
      };

      // Replace temp chat with permanent chat
      setChats((prevChats) => {
        return prevChats.map((chat) => (chat._id === tempId ? newChat : chat));
      });

      // IMPORTANT: Update favorites if this temp chat was favorited
      if (res?.data.chatId && res.data.chatId !== tempId) {
        setFavorites((prevFavorites) => {
          return prevFavorites.map((fav) =>
            fav._id === tempId ? { ...fav, _id: res.data.chatId } : fav
          );
        });
      }

      // Other stuff
      if (res?.data.themeData) {
        setThemeData(res.data.themeData);
        setSelectedTheme(res.data.themeData.name);
        setShowThemeSection(true);
      }
      getRandomQuote();
      setInput("");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
    setShowSkeleton(false);
    scrollToTop();
  };

  const [styles, setStyles] = useState(
    getStyles(theme, fontSize, isOpen, isListening)
  );
  useEffect(() => {
    setStyles(getStyles(theme, fontSize, isOpen, isListening));
  }, [theme, fontSize, isOpen, isListening]);
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
    <button style={{
      ...styles.logoutbutton,
      position: "fixed",
      zIndex: 1001,
      }} onClick={() => navigate("/logout")}>Logout</button>
          <h1 style={styles.title}>
            <FaOm size={36} color="#8B0000" /> Divine Wisdom: Bhagavad Gita
          </h1>
          <p style={styles.subtitle}>
            Seek timeless guidance from Lord Krishna's teachings
          </p>

          <div style={styles.geetaQuote}>{currentQuote}</div>
          <button
            className="themes-button"
            onClick={() => setShowThemeSection(!showThemeSection)}
          >
            {showThemeSection ? "Hide Themes" : "Explore Themes"}
          </button>

          <form onSubmit={handleSubmit} style={styles.form}>
            <button
              type="button"
              onClick={handleVoiceInput}
              style={styles.voiceButton}
              title="Speak your question"
            >
              <FaMicrophone />
            </button>

            <div style={styles.inputWrapper}>
              <FaBookOpen style={styles.bookIcon} />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                style={styles.input}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setInput("");
                }}
              />
              {input === "" && (
                <div style={styles.scrollingPlaceholder}>
                  <div style={styles.scrollingText}>
                    Ask a question about life, dharma, karma, or purpose...
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? (
                <>
                  Contemplating...{" "}
                  <FaDharmachakra
                    style={{ animation: "spin 2s linear infinite" }}
                  />
                </>
              ) : (
                <>
                  Ask Krishna <FaRegPaperPlane />
                </>
              )}
            </button>
          </form>

          <div style={styles.preferencesBar}>
            <button
              onClick={() => {
                toggleSound.play();

                const newTheme = theme === "light" ? "dark" : "light";
                localStorage.setItem("theme", newTheme);
                setTheme(newTheme);
              }}
              style={styles.preferencesButton}
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>

            <div style={styles.fontSizeControls}>
              <button
                onClick={() => {
                  toggleSound.play();
                  setFontSize("small");
                  localStorage.setItem("fontSize", "small");
                }}
                style={{
                  ...styles.fontButton,
                  backgroundColor: fontSize === "small" ? "#8B0000" : "#B8860B",
                  fontSize: "0.8rem",
                }}
                title="Small Font"
              >
                A
              </button>

              <button
                onClick={() => {
                  toggleSound.play();
                  setFontSize("medium");
                  localStorage.setItem("fontSize", "medium");
                }}
                style={{
                  ...styles.fontButton,
                  backgroundColor:
                    fontSize === "medium" ? "#8B0000" : "#B8860B",
                  fontSize: "1.2rem",
                }}
                title="Medium Font"
              >
                A
              </button>

              <button
                onClick={() => {
                  toggleSound.play();
                  setFontSize("large");
                  localStorage.setItem("fontSize", "large");
                }}
                style={{
                  ...styles.fontButton,
                  backgroundColor: fontSize === "large" ? "#8B0000" : "#B8860B",
                  fontSize: "1.6rem",
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
        </div>
        <div style={styles.paper}>
          <div
            style={{
              ...styles.inputWrap,
              position: showInputWrapper ? 0 : "fixed",
              bottom: showInputWrapper ? "auto" : "10px",
              left: "45px",
              right: "995px",
              zIndex: 1000,
              opacity: showInputWrapper ? 0 : 1,
            }}
          >
            <FaBookOpen style={styles.bookIcon} />

            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                style={{
                  ...styles.input, // space for the send button
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setInput("");
                  if (e.key === "Enter" && !loading) handleSubmit(e);
                }}
              />

              {input === "" && (
                <div style={styles.scrollingPlaceholder2}>
                  <div style={styles.scrollingText}>
                    Ask a question about life, dharma, karma, or purpose...
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.smallSubmit,
                    position: "absolute",
                    top: "50%",
                    right: "8px",
                    transform: "translateY(-50%)",
                  }}
                  onClick={() => handleSubmit()}
                >
                  {loading ? (
                    <>
                      Contemplating...{" "}
                      <FaDharmachakra
                        style={{ animation: "spin 2s linear infinite" }}
                      />
                    </>
                  ) : (
                    <FaRegPaperPlane />
                  )}
                </button>
              </form>
            </div>
          </div>
          {showThemeSection && (
            <div className="themes-section">
              <div style={{
                display: "flex",
                justifyContent: "center",
              }}>
              <ThemeNavigation onSelectTheme={handleThemeSelect} />
              </div>
              {themeData && (
                <ThemeDetails
                  themeData={themeData}
                  onClose={handleCloseThemeDetails}
                />
              )}
            </div>
          )}
          <div style={styles.chatContainer}>
            {/* Header with Favorites + Select/Share buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                flexWrap: "nowrap",
                gap: "10px",
              }}
            >
              {favorites.length > 0 && (
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  style={{
                    ...styles.favoritesButton,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <FaStar />{" "}
                  {showFavorites
                    ? "Hide Favorites"
                    : `View All Favorites (${favorites.length})`}
                </button>
              )}

              <button
                onClick={() => setSelectMode(!selectMode)}
                style={{
                  ...styles.smallButtonStyle,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {selectMode ? "Cancel" : "Select Chats"}
              </button>
            </div>

            {selectMode && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "15px",
                }}
              >
                <button
                  onClick={toggleSelectAll}
                  style={styles.smallButtonStyle}
                >
                  {Object.keys(selectedChats).length === chats.length
                    ? "Unselect All"
                    : "Select All"}
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
                    <FaSpinner
                      style={{ animation: "spin 2s linear infinite" }}
                    />
                  ) : (
                    <FaTrash />
                  )}{" "}
                  Delete Selected
                </button>

                {Object.keys(selectedChats).length > 0 && (
                  <span
                    style={{
                      backgroundColor:
                        theme === "light" ? "#FFF0CC" : "#3D3D3D",
                      color: theme === "light" ? "#8B4513" : "#CD853F",
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
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
                <h2
                  style={{
                    ...styles.subtitle,
                    textAlign: "left",
                    marginBottom: "1rem",
                  }}
                >
                  Your Favorite Wisdom
                </h2>

                {favorites.map((chat, index) => (
                  <div key={`fav-${index}`} style={styles.chatBubble}>
                    {selectMode && (
                      <div
                        style={{
                          position: "absolute",
                          top: "15px",
                          left: "15px",
                          zIndex: 5,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedChats[chat._id || `fav-${index}`]}
                          onChange={() => {
                            setSelectedChats((prev) => ({
                              ...prev,
                              [chat._id || `fav-${index}`]:
                                !prev[chat._id || `fav-${index}`],
                            }));
                          }}
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    )}

                    {/* Action buttons container */}
                    <div
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        display: "flex",
                        gap: "8px",
                        zIndex: 5,
                      }}
                    >
                      {/* Unfavorite button */}
                      <button
                        onClick={() => handleFav(chat)}
                        style={{
                          ...styles.favoriteButton,
                          color: "#FFD700", // Always gold since this is in favorites section
                        }}
                        title="Remove from favorites"
                      >
                        <FaStar />
                      </button>

                      {/* Delete permanently button */}
                      <button
                        onClick={() => handleDeleteFavoriteChat(chat, index)}
                        style={styles.deleteButton}
                        disabled={loading}
                        title="Delete this conversation permanently"
                      >
                        {loading ? (
                          <FaSpinner
                            style={{ animation: "spin 2s linear infinite" }}
                          />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>

                    <p style={{ ...styles.timestamp }}>
                      {formatTimestamp(chat.createdAt)}
                    </p>
                    <p style={styles.userMessage}>
                      <strong>Your Question:</strong> {chat.userMessage}
                    </p>
                    <p style={styles.botResponse}>
                      <strong>Divine Guidance:</strong>{" "}
                      {(chatLanguages[chat._id || `fav-${index}`] ||
                        "english") === "english"
                        ? chat.botResponse
                        : chat.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है"}
                    </p>

                    <div style={styles.languageToggle}>
                      <button
                        onClick={() => {
                          toggleSound.play();
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "english",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          backgroundColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? theme === "light"
                                ? "#8B0000"
                                : "#B22222"
                              : theme === "light"
                              ? "#B8860B"
                              : "#CD853F",
                        }}
                      >
                        English
                      </button>

                      <button
                        onClick={() => {
                          toggleSound.play();
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "hindi",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          backgroundColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? theme === "light"
                                ? "#8B0000"
                                : "#B22222"
                              : theme === "light"
                              ? "#B8860B"
                              : "#CD853F",
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
                            — Bhagavad Gita, Chapter {chat.chapter}, Verse{" "}
                            {chat.verse}
                          </p>
                        )}
                        {/* Add translation here */}
                        {chat.translation && (
                          <p style={styles.shlokaTranslation}>
                            "{chat.translation}"
                          </p>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
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
                          backgroundColor:
                            theme === "light" ? "#8B4513" : "#CD853F",
                        }}
                        title="Export as PDF"
                      >
                        <FaBookOpen /> Export PDF
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    textAlign: "center",
                    margin: "2rem 0",
                    position: "relative",
                  }}
                >
                  <hr
                    style={{
                      border: "none",
                      borderTop: "3px double #8B4513", // dark brown double line for antique feel
                      margin: "0 auto",
                      width: "80%",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "-0.8rem",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#fdf6e3", // soft parchment-like background
                      padding: "0 1rem",
                      color: "#5C4033",
                      fontStyle: "italic",
                      fontFamily: '"Georgia", serif',
                      fontSize: "0.9rem",
                    }}
                  >
                    Your Favorites End Here
                  </span>
                </div>
              </div>
            )}

            {chats?.slice(0, visibleChats).map((chat, index) => (
              <div
                key={chat._id || index}
                style={{
                  ...styles.chatBubble,
                  position: "relative",
                  ...(selectedChats[chat._id || index]
                    ? styles.selectedChatBubble
                    : {}),
                }}
                ref={(el) => (chatRefs.current[index] = el)}
              >
                {selectMode && (
                  <div
                    style={{
                      position: "absolute",
                      top: "15px",
                      left: "15px",
                      zIndex: 5,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedChats[chat._id || index]}
                      onChange={() => {
                        setSelectedChats((prev) => ({
                          ...prev,
                          [chat._id || index]: !prev[chat._id || index],
                        }));
                      }}
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                )}
                {editingChatId === index ? (
                  // Edit mode
                  <div style={{ marginBottom: "10px" }}>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: `1px solid ${
                          theme === "light" ? "#ccc" : "#444"
                        }`,
                        backgroundColor: theme === "light" ? "#fff" : "#333",
                        color: theme === "light" ? "#333" : "#fff",
                        minHeight: "100px",
                        marginBottom: "10px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => handleSaveEdit(index)}
                        disabled={loading}
                        style={{
                          ...styles.shareButton,
                          backgroundColor:
                            theme === "light" ? "#8B0000" : "#B22222",
                        }}
                      >
                        {loading ? (
                          <FaSpinner
                            style={{ animation: "spin 2s linear infinite" }}
                          />
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loading}
                        style={{
                          ...styles.shareButton,
                          backgroundColor:
                            theme === "light" ? "#B8860B" : "#CD853F",
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
                      {loading ? (
                        <FaSpinner
                          style={{ animation: "spin 2s linear infinite" }}
                        />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditChat(index, chat.userMessage)}
                      style={{
                        ...styles.editButton,
                        color: theme === "light" ? "#8B4513" : "#CD853F",
                      }}
                      title="Edit your question"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => {
                        console.log("Button clicked for chat:", chat._id);
                        console.log("Chat object:", chat);
                        console.log("Favorites before click:", favorites);
                        handleFav(chat);
                      }}
                      style={{
                        ...styles.favoriteButton,
                        color: (() => {
                          const isFavorited = favorites.some(
                            (fav) => fav._id === chat._id
                          );
                          console.log(
                            `Chat ${chat._id} is favorited:`,
                            isFavorited
                          );
                          return isFavorited ? "#FFD700" : "#8B4513";
                        })(),
                      }}
                      title={
                        favorites.some((fav) => fav._id === chat._id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <FaStar />
                    </button>

                    <p style={{ ...styles.timestamp }}>
                      {formatTimestamp(chat.createdAt)}
                    </p>

                    <p style={styles.userMessage}>
                      <strong>Your Question:</strong> {chat.userMessage}
                    </p>
                    <p style={styles.botResponse}>
                      <strong>Divine Guidance:</strong>{" "}
                      {(chatLanguages[chat._id || index] || "english") ===
                      "english"
                        ? chat.botResponse
                        : chat.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है"}
                    </p>

                    <div style={styles.languageToggle}>
                      <button
                        onClick={() => {
                          toggleSound.play();
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "english",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          backgroundColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? theme === "light"
                                ? "#8B0000"
                                : "#B22222"
                              : theme === "light"
                              ? "#B8860B"
                              : "#CD853F",
                        }}
                      >
                        English
                      </button>

                      <button
                        onClick={() => {
                          toggleSound.play();
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "hindi",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          backgroundColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? theme === "light"
                                ? "#8B0000"
                                : "#B22222"
                              : theme === "light"
                              ? "#B8860B"
                              : "#CD853F",
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
                            — Bhagavad Gita, Chapter {chat.chapter}, Verse{" "}
                            {chat.verse}
                          </p>
                        )}
                        {/* Add translation here */}
                        {chat.translation && (
                          <p style={styles.shlokaTranslation}>
                            "{chat.translation}"
                          </p>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
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
                          backgroundColor:
                            theme === "light" ? "#8B4513" : "#CD853F",
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

            {/* Load more button */}
            {chats.length > visibleChats && (
              <button
                onClick={async () => {
                  moreSound.play();
                  loadMoreChats();
                }}
                style={styles.viewMoreButton}
              >
                View More Conversations
              </button>
            )}
          </div>
          {chats.length > 0 && (
            <button onClick={handleExportAllChats}>
              <FaBookOpen style={{ marginRight: "8px" }} /> Export All
              Conversations
            </button>
          )}
          <div style={styles.footer}>
            <p>
              <span>Made with</span> <FaHeart color="#8B0000" />{" "}
              <span>and ancient wisdom.</span>
            </p>
            <p className="text-sm italic text-gray-500">
              <em>
                Disclaimer: This chatbot may occasionally generate incorrect
                information.{" "}
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-700 underline"
                >
                  Learn more
                </a>
              </em>
            </p>
            <ScrollToTop theme={theme} />
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};
export default BhagavadGitaBot;
