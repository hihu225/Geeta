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
  useContext,
} from "react";
import ExportChats from "./components/exportChats.jsx";
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
import Swal from "sweetalert2";
import {UserContext} from "./UserContext.jsx";
import { ThemeContext } from "./ThemeContext";
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

const getISTGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening";
  } else {
    return "Peaceful Night";
  }
};


  const handleShare = async (chatId) => {
    try {
      const isTempId = chatId.length !== 24; // UUIDs are not 24 chars

      if (isTempId) {
        const tempChat = chats.find((chat) => chat._id === chatId);
        if (!tempChat) {
          alert("Chat not found.");
          return;
        }

        // Replicate backend share text logic here
        const responseText = tempChat.hindiResponse || tempChat.botResponse;
        let shlokaInfo = tempChat.shloka || "";
        if (tempChat.translation) {
          shlokaInfo += `\n${tempChat.translation}`;
        }
        if (tempChat.chapter && tempChat.verse) {
          shlokaInfo += `\n(Bhagavad Gita ${tempChat.chapter}:${tempChat.verse})`;
        }

        const shareText = `🕉️ Bhagavad Gita Wisdom 🕉️\n\n✨ ${responseText}\n\n📖 Shloka: ${shlokaInfo}\n\n🔗 via Bhagavad Gita Bot`;

        await Share.share({
          title: "Bhagavad Gita Wisdom",
          text: shareText,
          dialogTitle: "Share via",
        });
      } else {
        // For permanent ID, use backend logic
        const res = await axios.get(`${REACT_APP_API_URL}/api/share/${chatId}`);
        const shareText = res.data.shareText;

        await Share.share({
          title: "Bhagavad Gita Wisdom",
          text: shareText,
          dialogTitle: "Share via",
        });
      }
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

  const handleSaveEdit = async (index) => {
  if (!editText.trim()) return;
  setLoading(true);

  try {
    const chatToUpdate = chats[index];

    // 1. Get new response
    const res = await axios.post(`${REACT_APP_API_URL}/api/generate-response`, {
      message: editText,
      chatHistory: chats.slice(0, index),
    });

    if (!res?.data) throw new Error("No response data received");

    // 2. Update chat in DB
    const updatedChatRes = await axios.put(
      `${REACT_APP_API_URL}/api/chats/${chatToUpdate._id}`,
      {
        userMessage: editText,
        botResponse: res.data.botResponse,
        hindiResponse: res.data.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है",
        shloka: res.data.shloka || "",
        translation: res.data.translation || "",
        chapter: res.data.chapter || "",
        verse: res.data.verse || "",
      }
    );

    const updatedChat = updatedChatRes.data;

    // 3. Move updated chat to top and update local state
    const newChats = [...chats];
    newChats.splice(index, 1); // Remove from current position
    newChats.unshift(updatedChat); // Add to beginning
    setChats(newChats);

    // Reset visible chats to 3 to show the updated chat at the top
    setVisibleChats(3);

    // 4. Update favorites if necessary
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
        title: "Chat Updated Successfully!",
        html: `
    <div style="text-align: center; margin-top: 10px;">
      <p style="color: #666; margin-bottom: 15px;">
        Your changes have been saved and applied to the conversation.
      </p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #28a745;">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
          <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
        </svg>
        <small style="font-weight: 500;">All changes synchronized</small>
      </div>
    </div>
  `,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Continue",
        confirmButtonColor: "#8B0000",
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: "animate__animated animate__fadeIn animate__faster",
          icon: "animate__animated animate__bounceIn animate__delay-1s",
        },
        didOpen: (toast) => {
          // Add hover effect to pause timer
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
    } catch (error) {
      console.error("Error updating chat:", error);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        html: `
    <div style="text-align: center; margin-top: 10px;">
      <p style="color: #666; margin-bottom: 15px;">
        We couldn't save your changes to the chat.
      </p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #dc3545; margin-bottom: 15px;">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <small style="font-weight: 500;">Your changes weren't saved</small>
      </div>
      ${
        error.message && error.message !== "Unknown error occurred."
          ? `<div style="background: #f8f9fa; border-left: 3px solid #dc3545; padding: 10px; margin: 15px 0; text-align: left; border-radius: 4px;">
          <strong style="color: #721c24;">Error Details:</strong><br>
          <code style="color: #6c757d; font-size: 12px;">${error.message}</code>
        </div>`
          : ""
      }
      <div style="font-size: 13px; color: #888; margin-top: 15px;">
        <strong>What you can try:</strong><br>
        • Check your internet connection<br>
        • Try making the update again<br>
        • Refresh the page if the issue persists
      </div>
    </div>
  `,
        reverseButtons: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        buttonsStyling: true,
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
              top: "20px",
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
              padding: "45px 35px 20px 15px",
              textAlign: "center",
              borderBottom:
                theme === "light" ? "2px solid #D4A017" : "2px solid #664D00",
            }}
          >
            <div
              style={{
                color: theme === "light" ? "#8B0000" : "#FF6B6B",
                fontSize: "1.3rem",
                fontWeight: "bold",

              }}
            >
              Conversation History
            </div>
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
    if (Object.values(selectedChats).filter(Boolean).length === 0) {
      await Swal.fire({
        icon: "info",
        title: "No Chats Selected",
        html: `
    <div style="text-align: center; margin-top: 10px;">
      <p style="color: #666; margin-bottom: 15px;">
        Please select at least one chat to delete before proceeding.
      </p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #17a2b8; margin-bottom: 15px;">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
        <small style="font-weight: 500;">Selection required</small>
      </div>
      <div style="background: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; padding: 12px; margin: 15px 0;">
        <div style="font-size: 13px; color: #004085;">
          <strong>How to select chats:</strong><br>
          • Check the boxes next to chat names<br>
          • Use "Select All" to choose multiple chats<br>
          • Then try the delete action again
        </div>
      </div>
    </div>
  `,
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Got it",
        confirmButtonColor: "#17a2b8",
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: "animate__animated animate__fadeInDown animate__faster",
          icon: "animate__animated animate__bounce animate__delay-1s",
        },
        didOpen: (toast) => {
          // Add hover effect to pause timer
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      return;
    }

    const confirmDelete = await Swal.fire({
      title: "Delete Chats?",
      text: `Are you sure you want to delete ${
        Object.keys(selectedChats).length
      } selected chat(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them",
      cancelButtonText: "Cancel",
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
        setVisibleChats(
          Math.max(1, chats.length - Object.keys(selectedChats).length)
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Chats Deleted Successfully!",
        html: `
    <div style="text-align: center; margin-top: 10px;">
      <p style="color: #666; margin-bottom: 15px;">
        ${
          Object.keys(selectedChats).length === 1
            ? "Your selected chat has been permanently removed."
            : `All ${
                Object.keys(selectedChats).length
              } selected chats have been permanently removed.`
        }
      </p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #28a745; margin-bottom: 15px;">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
        <small style="font-weight: 500;">
          ${
            Object.keys(selectedChats).length === 1
              ? "1 chat removed"
              : `${Object.keys(selectedChats).length} chats removed`
          }
        </small>
      </div>
      <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 10px; margin: 15px 0;">
        <div style="font-size: 13px; color: #155724;">
          <strong>✓ Action completed</strong><br>
          Your chat list has been updated and the selected conversations are no longer accessible.
        </div>
      </div>
    </div>
  `,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Continue",
        confirmButtonColor: "#28a745",
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: "animate__animated animate__zoomIn animate__faster",
          icon: "animate__animated animate__bounceIn animate__delay-1s",
        },
        didOpen: (toast) => {
          // Add hover effect to pause timer
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
    } catch (error) {
      console.error("Error deleting selected chats:", error);
      await Swal.fire({
        icon: "error",
        title: "Deletion Failed",
        html: `
    <div style="text-align: center; margin-top: 10px;">
      <p style="color: #666; margin-bottom: 15px;">
        We couldn't delete the selected ${
          Object.keys(selectedChats).length === 1 ? "chat" : "chats"
        } at this time.
      </p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #dc3545; margin-bottom: 15px;">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <small style="font-weight: 500;">
          ${
            Object.keys(selectedChats).length === 1
              ? "Chat remains in your list"
              : "Chats remain in your list"
          }
        </small>
      </div>
      ${
        error.message && error.message !== "An unknown error occurred"
          ? `<div style="background: #f8f9fa; border-left: 3px solid #dc3545; padding: 10px; margin: 15px 0; text-align: left; border-radius: 4px;">
          <strong style="color: #721c24;">Error Details:</strong><br>
          <code style="color: #6c757d; font-size: 12px;">${error.message}</code>
        </div>`
          : ""
      }
      <div style="font-size: 13px; color: #888; margin-top: 15px;">
        <strong>What you can try:</strong><br>
        • Check your internet connection<br>
        • Try selecting and deleting again<br>
        • Refresh the page if the issue persists<br>
        • Contact support if the problem continues
      </div>
    </div>
  `,
        reverseButtons: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        buttonsStyling: true,
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
        html: `
          <div style="text-align: center; margin-top: 10px;">
            <p style="color: #666; margin-bottom: 15px;">
              The selected chat could not be found or is no longer available for export.
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #dc3545; margin-bottom: 15px;">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                <path d="M8.646 6.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 9 8.646 7.354a.5.5 0 0 1 0-.708zm-1.292 0a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.707 9l1.647-1.646a.5.5 0 0 0 0-.708z"/>
              </svg>
              <small style="font-weight: 500;">Chat is not accessible</small>
            </div>
            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; margin: 15px 0;">
              <div style="font-size: 13px; color: #495057;">
                <strong>Possible reasons:</strong><br>
                • The chat may have been deleted<br>
                • Chat data could be corrupted<br>
                • You may not have access to this chat<br>
                • There might be a temporary sync issue
              </div>
            </div>
            <div style="font-size: 13px; color: #888; margin-top: 15px;">
              <strong>What you can try:</strong><br>
              • Select a different chat to export<br>
              • Refresh the page and try again<br>
              • Check if the chat still exists in your list
            </div>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Select Another Chat",
        confirmButtonColor: "#8B0000",
        showCancelButton: true,
        cancelButtonText: "Close",
        reverseButtons: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: "animate__animated animate__fadeInDown animate__faster",
          confirmButton: "swal2-confirm-button-custom",
          cancelButton: "swal2-cancel-button-custom",
        },
        buttonsStyling: true,
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
      // Save PDF first
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
      });

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "PDF Saved Successfully!",
        html: `
          <div style="text-align: center; margin-top: 10px;">
            <p style="color: #666; margin-bottom: 15px;">
              Your conversation has been saved to your documents folder.
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #28a745;">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.293 4L10 .707A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4.5 10.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4.5 12a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7z"/>
              </svg>
              <small style="font-weight: 500;">Ready to view or share</small>
            </div>
          </div>
        `,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "animate__animated animate__fadeInDown animate__faster",
          icon: "animate__animated animate__bounceIn animate__delay-1s",
        },
      });

      // Show share options
      const result = await Swal.fire({
        icon: "question",
        title: "Share PDF?",
        html: `
          <div style="text-align: center; margin-top: 10px;">
            <p style="color: #666; margin-bottom: 15px;">
              Would you like to share your Bhagavad Gita PDF with others?
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #17a2b8;">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
              <small style="font-weight: 500;">Share with friends & family</small>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Share',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        customClass: {
          popup: "animate__animated animate__fadeInUp animate__faster",
          icon: "animate__animated animate__pulse animate__delay-1s",
        },
      });

      // Handle user's choice
      if (result.isConfirmed) {
        try {
          const fileUri = await Filesystem.getUri({
            directory: Directory.Documents,
            path: fileName,
          });

          await Share.share({
            title: "Share Bhagavad Gita PDF",
            text: "Here is some divine wisdom from Geeta GPT",
            url: fileUri.uri,
            dialogTitle: "Share PDF",
          });
        } catch (shareError) {
          console.error("Error sharing PDF:", shareError);
          await Swal.fire({
            icon: "error",
            title: "Share Failed",
            html: `
              <div style="text-align: center; margin-top: 10px;">
                <p style="color: #666; margin-bottom: 15px;">
                  We couldn't share your PDF at this moment.
                </p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #dc3545; margin-bottom: 15px;">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                  <small style="font-weight: 500;">Sharing failed</small>
                </div>
                <div style="font-size: 13px; color: #888;">
                  <strong>Your PDF is still saved!</strong><br>
                  You can find it in your documents folder.
                </div>
              </div>
            `,
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
      // If cancelled, do nothing - PDF is already saved
    } else {
      // For web platform
      doc.save(fileName);
      
      // Show success message for web
      await Swal.fire({
        icon: "success",
        title: "PDF Downloaded!",
        html: `
          <div style="text-align: center; margin-top: 10px;">
            <p style="color: #666; margin-bottom: 15px;">
              Your Bhagavad Gita conversation has been downloaded successfully.
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #28a745;">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              <small style="font-weight: 500;">Check your downloads folder</small>
            </div>
          </div>
        `,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    await Swal.fire({
      icon: "error",
      title: "Export Failed",
      html: `
        <div style="text-align: center; margin-top: 10px;">
          <p style="color: #666; margin-bottom: 15px;">
            We couldn't save your PDF at this moment.
          </p>
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #dc3545; margin-bottom: 15px;">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <small style="font-weight: 500;">This is usually temporary</small>
          </div>
          <div style="font-size: 13px; color: #888;">
            <strong>What you can try:</strong><br>
            • Check your internet connection<br>
            • Refresh the page and try again<br>
          </div>
        </div>
      `,
      allowOutsideClick: true,
      allowEscapeKey: true,
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
    // Don't change showThemeSection here - keep it true to stay in theme section
  } catch (error) {
    console.error("Error fetching theme details:", error);
  }
};

  const handleCloseThemeDetails = () => {
  // Reset theme data and selected theme to go back to theme navigation
  setSelectedTheme(null);
  setThemeData(null);
  // Keep showThemeSection true to stay in the theme section
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
            setChats((prevChats) => prevChats.filter((c) => c._id !== chat._id));
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
            text: "Unable to delete the chat. Please check your connection and try again.",
            showClass: {
              popup: "animate__animated animate__shakeX animate__faster",
            },
            hideClass: {
              popup: "animate__animated animate__fadeOut animate__faster",
            },
            buttonsStyling: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
            backdrop: `
    rgba(0,0,0,0.5)
    left top
    no-repeat
  `,
          });
        }
      }
    } catch (error) {
      console.error("Error deleting favorite chat:", error);
      await Swal.fire({
        icon: "error",
        title: "Error Deleting Chat",
        html: `
    <p class="text-gray-600 mb-3">Unable to delete the chat due to the following error:</p>
    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <code class="text-sm text-red-700 font-mono">${
        error.message || "Unknown error occurred"
      }</code>
    </div>
    <p class="text-sm text-gray-500">Please try again or contact support if the issue persists.</p>
  `,
        showClass: {
          popup: "animate__animated animate__shakeX animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut animate__faster",
        },
        buttonsStyling: false,
        allowOutsideClick: true,
        allowEscapeKey: true,
        width: "500px",
      });
    } finally {
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
      setLoadingStates((prev) => ({ ...prev, [index]: true }));


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

        // Adjust visible chats after deletion
        setVisibleChats((prev) => {
          const newChatCount = chats.length - 1;
          // Ensure we show at least 3 chats if available, but not more than total
          return Math.min(Math.max(3, prev), newChatCount);
        });

        console.log("Chat deleted successfully");
      } else {
        console.error("Backend reported delete failure:", response.data);
        await Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "Unable to delete the chat. Please check your connection and try again.",
          showClass: {
            popup: "animate__animated animate__shakeX animate__faster",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut animate__faster",
          },
          allowOutsideClick: true,
          allowEscapeKey: true,
          backdrop: `
    rgba(0,0,0,0.5)
    left top
    no-repeat
  `,
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
            text: "Unable to delete the chat. Please check your connection and try again.",
            confirmButtonText: "Retry",
            confirmButtonColor: "#dc2626",
            showClass: {
              popup: "animate__animated animate__shakeX animate__faster",
            },
            hideClass: {
              popup: "animate__animated animate__fadeOut animate__faster",
            },
            customClass: {
              confirmButton:
                "px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300",
              title: "text-xl font-bold text-gray-800",
              htmlContainer: "text-gray-600",
            },
            buttonsStyling: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
          });
        }
      } catch (fallbackError) {
        console.error("Fallback delete also failed:", fallbackError);
        await Swal.fire({
          icon: "error",
          title: "Error Deleting Chat",
          html: `
    <p class="text-gray-600 mb-3">Unable to delete the chat due to an error:</p>
    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <code class="text-sm text-red-700 font-mono">${
        fallbackError.message || "Unknown error occurred"
      }</code>
    </div>
    <p class="text-sm text-gray-500">Please try again or refresh the page if the issue persists.</p>
  `,
          showClass: {
            popup: "animate__animated animate__shakeX animate__faster",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut animate__faster",
          },
          buttonsStyling: false,
          allowOutsideClick: true,
          allowEscapeKey: true,
          width: "500px",
        });
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));

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
          text: "Please select at least one chat before sharing.",
          confirmButtonText: "Got it",
          confirmButtonColor: "#3b82f6",
          showClass: {
            popup: "animate__animated animate__fadeInDown animate__faster",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut animate__faster",
          },
          customClass: {
            confirmButton:
              "px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300",
            title: "text-xl font-bold text-gray-800",
            htmlContainer: "text-gray-600",
          },
          buttonsStyling: false,
          timer: 4000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
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
          title: "Successfully Copied!",
          text: "Multiple chats have been copied to your clipboard",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          customClass: {
            popup: "colored-toast",
          },
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
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
  const { theme, setTheme } = useContext(ThemeContext);
  const [loadingStates, setLoadingStates] = useState({});
  // Add ref for auto-
  const { user } = useContext(UserContext);
  const isDemoUser = user?.email?.endsWith('@example.com');
  const displayName = isDemoUser ? "Spiritual Seeker" : user?.name || "Seeker";
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/chats`);
        setChats(response.data);
        // Always show 3 chats initially, or less if there are fewer than 3 total chats
        setVisibleChats(Math.min(3, response.data.length));
        setFavorites(response.data.filter((chat) => chat.isFavorite));
        getRandomQuote();
      } catch (error) {
        console.error("Error fetching chats:", error);
        alert("Failed to load chats. Please try again later.");
      }
    };
    fetchChats();
  }, []);
  useEffect(() => {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
}, [theme]);

  const loadMoreChats = () => {
    setVisibleChats((prev) => Math.min(prev + 3, chats.length));
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  const vedicQuotes = [
  {
    verse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन॥ - BG 2.47",
    meaning: "You have the right to perform your duties, but not to the fruits of your actions."
  },
  {
    verse: "योगः कर्मसु कौशलम्॥ - BG 2.50",
    meaning: "Yoga is skill in action."
  },
  {
    verse: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज॥ - BG 18.66",
    meaning: "Abandon all varieties of dharma and simply surrender unto Me."
  },
  {
    verse: "विद्या विनय संपन्ने ब्राह्मणे गवि हस्तिनि॥ - BG 5.18",
    meaning: "The wise see all beings equally — a learned Brahmin, a cow, an elephant, even a dog or outcaste."
  },
  {
    verse: "न हि कश्चित्क्षणमपि जातु तिष्ठत्यकर्मकृत्॥ - BG 3.5",
    meaning: "No one can remain without action even for a moment."
  },
  {
    verse: "उद्धरेदात्मनाऽत्मानं नात्मानमवसादयेत्॥ - BG 6.5",
    meaning: "Elevate yourself by your own self, do not degrade yourself."
  },
  {
    verse: "मन: प्रसाद: सौम्यत्वं मौनमात्मविनिग्रह:॥ - BG 17.16",
    meaning: "Serenity of mind, gentleness, silence, self-restraint are mental austerities."
  },
  {
    verse: "ज्ञानेन तु तदज्ञानं येषां नाशितमात्मन:॥ - BG 5.16",
    meaning: "For those whose ignorance is destroyed by knowledge, that knowledge reveals the Supreme."
  },
  {
    verse: "न त्वेवाहं जातु नासं न त्वं नेमे जनाधिपा:॥ - BG 2.12",
    meaning: "Never was there a time when I did not exist, nor you, nor all these kings."
  },
  {
    verse: "श्रीभगवानुवाच: समये मृत्यु: च य: स्मरन् मम एव एष्यति॥ - BG 8.5",
    meaning: "Whoever remembers Me at the time of death comes to Me alone."
  }
];
const getRandomQuote = () => {
  const random = vedicQuotes[Math.floor(Math.random() * vedicQuotes.length)];
  setCurrentQuote(random);
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
            icon: "warning",
            title: "Speech Recognition Unavailable",
            html: `
    <p>Speech recognition isn't supported on this device or browser.</p>
    <div style="margin-top: 12px; padding: 8px; background-color: #f3f4f6; border-radius: 4px; font-size: 14px;">
      <strong>Alternatives:</strong><br>
      • Type your message manually<br>
      • Check if microphone permissions are enabled
    </div>
  `,
            confirmButtonText: "I understand",
            confirmButtonColor: "#3b82f6",
            customClass: {
              popup: "swal2-warning-modern",
              htmlContainer: "text-left",
            },
            allowOutsideClick: true,
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
            icon: "info",
            title: "Switch to Chrome, Edge, or Safari for speech recognition",
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            customClass: {
              popup: "browser-compat-toast",
            },
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
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
    const tempId = uuidv4();

    const tempChat = {
      _id: tempId,
      userMessage: input,
      botResponse: "...loading...",
      createdAt: new Date(),
    };
    setChats([tempChat, ...chats]);
    
    // Reset to show only 3 latest chats when new message comes
    setVisibleChats(3);

    try {
      const res = await axios.post(`${REACT_APP_API_URL}/api/message`, {
        message: input,
        chatHistory: chats.slice(0, 5),
      });
      responseSound.play();

      const newChat = {
        _id: res?.data._id,
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

      // Keep visibleChats at 3 to show only latest 3 chats
      setVisibleChats(3);

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
      // Remove the temp chat if there was an error
      setChats((prevChats) => prevChats.filter(chat => chat._id !== tempId));
      // Reset to 3 or current length - 1, whichever is smaller
      setVisibleChats(Math.min(3, chats.length));
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
  useEffect(() => {
    if (favorites.length === 0) {
      setShowFavorites(false);
    }
  }, [favorites]);
  return (
    <div>
      <SideNavigation
        chats={chats}
        scrollToChat={scrollToChat}
        theme={theme} // Pass theme prop
      />
      {/* <div style={styles.paper
    } */}

      <div
  className="container"
  style={{
    background:
      theme === "light"
        ? "linear-gradient(135deg, #FDF5E6, #F8E8C8, #F5DEB3)"
        : "linear-gradient(135deg, #2A2A2A, #1A1A1A, #121212)",
    color: theme === "light" ? "#333" : "#ccc",
  }}
>

        <div
  className="paper"
  style={{
    backgroundColor: theme === "light"
      ? "rgba(255, 252, 240, 0.97)"
      : "rgba(40, 40, 40, 0.97)",
    border: theme === "light"
      ? "2px solid #D4A017"
      : "2px solid #664D00",
    color: theme === "light" ? "#333" : "#ccc", 
  }}
>

          <button
            style={{
              ...styles.logoutbutton,
              position: "fixed",
            }}
            onClick={() => navigate("/account-settings")}
          >
            Account Settings
          </button>
          <h1 className={`title ${fontSize}`}>
  <FaOm className={`title-icon ${fontSize}`} /> Divine Wisdom: Bhagavad Gita
</h1>

<p className={`subtitle ${fontSize}`}>
  Seek timeless guidance from Lord Krishna's teachings
</p>

<p className={`greeting ${fontSize}`}>
  {getISTGreeting()}, {displayName}! 🙏
</p>



          <div className={`geeta-quote ${theme} ${fontSize}`}>
  <div style={{ marginBottom: "8px" }}>{currentQuote?.verse}</div>
  <div className={`geeta-meaning ${theme}`}>
    <div className={`geeta-meaning-text ${fontSize}`}>
      {currentQuote?.meaning}
    </div>
  </div>
</div>


          <button
            className={`themes-button ${fontSize}`}
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

            <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
  <button
    type="submit"
    disabled={loading}
    style={styles.submitButton}
  >
    {loading ? (
      <>
        Contemplating...{" "}
        <FaDharmachakra style={{ animation: "spin 2s linear infinite" }} />
      </>
    ) : (
      <>
        Ask Krishna <FaRegPaperPlane />
      </>
    )}
  </button>
</div>


          </form>

          <div style={styles.preferencesBar}>
            <button
      onClick={() => {
        toggleSound.play();
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
      }}
      style={styles.preferencesButton}
      title={
        theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div style={{ display: selectedTheme ? 'none' : 'block' }}>
        <ThemeNavigation onSelectTheme={handleThemeSelect} />
      </div>

            
              {selectedTheme && themeData && (
                <ThemeDetails
                  themeData={themeData}
                  onClose={handleCloseThemeDetails}
                />
              )}
            </div></div>
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
                  {Object.values(selectedChats).filter(Boolean).length === chats.length
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

                {Object.values(selectedChats).filter(Boolean).length > 0 && (
  <span
    style={{
      backgroundColor: theme === "light" ? "#FFF0CC" : "#3D3D3D",
      color: theme === "light" ? "#8B4513" : "#CD853F",
      padding: "5px 10px",
      borderRadius: "15px",
      fontSize: "0.8rem",
      fontWeight: "bold",
    }}
  >
    {Object.values(selectedChats).filter(Boolean).length} selected
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
                      disabled={loadingStates[index]}
                      title="Delete this conversation"
                    >
                      {loadingStates[index] ? (
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
                    {loading ? (
                      <></>
                    ) : (
                      <>
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
                      </>
                    )}

                    <p style={{ ...styles.timestamp }}>
  {formatTimestamp(chat.updatedAt || chat.createdAt)}
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
                className={`view-more-button ${theme} ${fontSize}`}
              >
                View More Conversations
              </button>
            )}
          </div>
          {chats.length > 0 && <ExportChats fontSize={fontSize} chats={chats} visibleChats={visibleChats}/>}
          <div className={`footer ${theme} ${fontSize}`}>
  <p>
    <span>Made with</span> <FaHeart color="#8B0000" />{" "}
    <span>and ancient wisdom.</span>
  </p>

  <p className="text-sm italic text-gray-500">
    <em>
      Disclaimer: This chatbot may occasionally generate incorrect information.{" "}
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
