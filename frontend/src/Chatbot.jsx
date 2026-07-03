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
import { FaRegPaperPlane, FaOm, FaBookOpen, FaHeart, FaBars, FaUserCircle, FaCompass } from "react-icons/fa";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import jsPDF from "jspdf";
import axios from "axios";
import ScrollToTop from "./ScrollToTop.jsx";
import { FaEdit } from "react-icons/fa";
import { getStyles } from "./utils/styleExport.js";
import OrnamentDivider from "./components/OrnamentDivider.jsx";
import AnimatedShloka from "./components/AnimatedShloka.jsx";
import ShareCardRenderer from "./components/ShareCardRenderer.jsx";
import DailyShlokaCard from "./components/DailyShlokaCard.jsx";
import StreakPill from "./components/StreakPill.jsx";
import SuggestionPills from "./components/SuggestionPills.jsx";
import SideNavigation from "./components/SideNavigation.jsx";
import html2canvas from "html2canvas";
import { Share } from "@capacitor/share";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import "./hihu.css";
import ThemeNavigation from "./ThemeNavigation.jsx";
import ThemeDetails from "./ThemeDetails.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCopy, FaCheck, FaPlus, FaPen, FaRegTrashAlt } from "react-icons/fa";

// Cheap UUID for local-only temp chat IDs. crypto.randomUUID is available in all
// modern browsers + Capacitor WebView; the fallback handles older embedded views.
const generateTempId = () =>
  (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    ? crypto.randomUUID()
    : `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
import Swal from "sweetalert2";
import {UserContext} from "./UserContext.jsx";
import { ThemeContext } from "./ThemeContext";
const REACT_APP_API_URL = import.meta.env.VITE_APP_API_URL;

// Audio assets are cached at module scope so we don't allocate a new HTMLAudioElement
// on every render (which previously leaked ~8 instances per re-render).
// `playSound` clones the cached buffer so overlapping plays don't interrupt each other.
const AUDIO_SOURCES = {
  tap: "/knock.mp3",
  toggle: "/toggle.mp3",
  delete: "/delete.mp3",
  more: "/more.mp3",
  start: "/start.mp3",
  stop: "/end.mp3",
  send: "/send.mp3",
  response: "/received.wav",
};
const AUDIO_VOLUME = { stop: 0.6 };
const audioCache = {};
const getAudio = (name) => {
  if (!audioCache[name]) {
    const el = new Audio(AUDIO_SOURCES[name]);
    if (AUDIO_VOLUME[name] != null) el.volume = AUDIO_VOLUME[name];
    audioCache[name] = el;
  }
  return audioCache[name];
};
const playSound = (name) => {
  try {
    const src = getAudio(name);
    // Clone so repeated triggers don't cut each other off.
    const el = src.cloneNode();
    el.volume = src.volume;
    const p = el.play();
    if (p && typeof p.catch === "function") p.catch(() => {}); // ignore autoplay-blocked
  } catch {
    /* audio is a nice-to-have; never throw from a sound effect */
  }
};

const BhagavadGitaBot = () => {
  const navigate = useNavigate();
  const location = useLocation();
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


  const buildShareLink = (chat) => {
    if (typeof window === "undefined") return "";
    const sid = chat?.sessionId;
    const origin = window.location.origin;
    return sid ? `${origin}/chat?s=${encodeURIComponent(sid)}` : `${origin}/chat`;
  };

  const handleShare = async (chatId) => {
    try {
      const isTempId = chatId.length !== 24; // UUIDs are not 24 chars
      const tempChat = chats.find((chat) => chat._id === chatId);
      const shareLink = buildShareLink(tempChat);

      if (isTempId) {
        if (!tempChat) {
          alert("Chat not found.");
          return;
        }

        const responseText = tempChat.hindiResponse || tempChat.botResponse;
        let shlokaInfo = tempChat.shloka || "";
        if (tempChat.translation) {
          shlokaInfo += `\n${tempChat.translation}`;
        }
        if (tempChat.chapter && tempChat.verse) {
          shlokaInfo += `\n(Bhagavad Gita ${tempChat.chapter}:${tempChat.verse})`;
        }

        const shareText = `🕉️ Bhagavad Gita Wisdom 🕉️\n\n✨ ${responseText}\n\n📖 Shloka: ${shlokaInfo}\n\n💫 Continue this conversation: ${shareLink}\n\n🔗 via GeetaGPT`;

        await Share.share({
          title: "Bhagavad Gita Wisdom",
          text: shareText,
          url: shareLink,
          dialogTitle: "Share via",
        });
      } else {
        // For permanent ID, use backend logic
        const res = await axios.get(`${REACT_APP_API_URL}/api/share/${chatId}`);
        const shareText = `${res.data.shareText}\n\n💫 Continue this conversation: ${shareLink}`;

        await Share.share({
          title: "Bhagavad Gita Wisdom",
          text: shareText,
          url: shareLink,
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
        element.style.backgroundColor = "rgba(245, 200, 120, 0.12)";
        element.style.borderLeft = "6px solid var(--gold)";

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
        // TEMP ID: toggle favorite locally ONLY (no backend call).
        // Use functional updater so rapid taps don't clobber each other.
        setFavorites((prev) =>
          isAlreadyFavorite
            ? prev.filter((fav) => fav._id !== chat._id)
            : [...prev, chat]
        );
      } else {
        // PERMANENT ID: update backend
        const response = await axios.put(
          `${REACT_APP_API_URL}/api/chats/${chat._id}/favorite`,
          { isFavorite: !isAlreadyFavorite },
          { headers: { "Content-Type": "application/json" } }
        );

        const updatedChat = response.data;

        setFavorites((prev) => {
          const withoutThis = prev.filter((fav) => fav._id !== chat._id);
          return updatedChat.isFavorite ? [...withoutThis, updatedChat] : withoutThis;
        });
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

          // Match by the exact user message + approximate creation time.
          // (The Chat schema has no `title` field — the previous title-match was
          //  comparing undefined === undefined and could target the wrong row.)
          const matchingChat = backendChats.data.find(
            (backendChat) =>
              backendChat.userMessage === chat.userMessage &&
              Math.abs(
                new Date(backendChat.createdAt) - new Date(chat.createdAt)
              ) < 60000
          );

          if (matchingChat) {
            // Delete the actual backend chat
            const response = await axios.delete(
              `${REACT_APP_API_URL}/api/chats/${matchingChat._id}`
            );

            if (response.data.success) {
              playSound("delete");
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
            playSound("delete");
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
          playSound("delete");

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
        playSound("delete");
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
          playSound("delete");
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
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = localStorage.getItem("current_session_id");
    if (saved) return saved;
    const fresh = generateTempId();
    localStorage.setItem("current_session_id", fresh);
    return fresh;
  });
  const [conversations, setConversations] = useState([]);
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
  const [shareCardChat, setShareCardChat] = useState(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const shareCardRef = useRef(null);

  const handleShareAsImage = async (chat) => {
    try {
      setGeneratingCard(true);
      setShareCardChat(chat);
      await new Promise((r) => setTimeout(r, 60));
      if (!shareCardRef.current) throw new Error("Card ref not ready");
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 1,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");

      if (Capacitor.isNativePlatform?.()) {
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
        const filename = `geeta-wisdom-${Date.now()}.png`;
        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache,
        });
        const uri = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        await Share.share({
          title: "Bhagavad Gita Wisdom",
          text: "🕉️ Wisdom from the Bhagavad Gita",
          url: uri.uri,
          dialogTitle: "Share this wisdom",
        });
      } else if (navigator.canShare && navigator.canShare({ files: [] })) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `geeta-wisdom-${Date.now()}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Bhagavad Gita Wisdom", text: "🕉️ Wisdom from the Bhagavad Gita" });
        } else {
          triggerDownload(dataUrl);
        }
      } else {
        triggerDownload(dataUrl);
      }
    } catch (err) {
      console.error("Share image error:", err);
      alert("Could not create image. Please try again.");
    } finally {
      setGeneratingCard(false);
      setShareCardChat(null);
    }
  };

  const [copiedChatId, setCopiedChatId] = useState(null);
  const handleCopyResponse = async (chat, chatKey) => {
    const lang = chatLanguages[chat._id || chatKey] || "english";
    const text = lang === "english"
      ? chat.botResponse
      : (chat.hindiResponse || chat.botResponse);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text || "");
      } else {
        const ta = document.createElement("textarea");
        ta.value = text || "";
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedChatId(chatKey);
      toast.success("Wisdom copied to clipboard", { autoClose: 1600 });
      setTimeout(() => setCopiedChatId((k) => (k === chatKey ? null : k)), 1600);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Could not copy — please try again");
    }
  };

  const triggerDownload = (dataUrl) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `geeta-wisdom-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [themeData, setThemeData] = useState(null);
  const { theme, setTheme } = useContext(ThemeContext);
  const [loadingStates, setLoadingStates] = useState({});
  // Add ref for auto-
  const { user } = useContext(UserContext);
  const isDemoUser = user?.email?.endsWith('@example.com');
  const displayName = isDemoUser ? "Spiritual Seeker" : user?.name || "Seeker";
  const messagesEndRef = useRef(null);
  const loadAllChats = async () => {
    const response = await axios.get(`${REACT_APP_API_URL}/api/chats`);
    return response.data;
  };

  const refreshConversations = async () => {
    try {
      const res = await axios.get(`${REACT_APP_API_URL}/api/conversations`);
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const filterBySession = (all, sessionId) =>
    all.filter((c) => (sessionId ? c.sessionId === sessionId : !c.sessionId));

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const all = await loadAllChats();
        // Restrict displayed chats to the current session (or legacy bucket if null).
        const scoped = filterBySession(all, currentSessionId);
        setChats(scoped);
        setVisibleChats(Math.min(3, scoped.length));
        setFavorites(all.filter((chat) => chat.isFavorite));
        getRandomQuote();
        refreshConversations();
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchToSession = async (sessionId) => {
    try {
      playSound("tap");
      const all = await loadAllChats();
      const scoped = filterBySession(all, sessionId);
      setChats(scoped);
      setVisibleChats(Math.min(3, scoped.length));
      setCurrentSessionId(sessionId);
      if (sessionId) localStorage.setItem("current_session_id", sessionId);
      else localStorage.removeItem("current_session_id");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to switch session:", err);
      toast.error("Could not load that conversation");
    }
  };

  const renameConversation = async (sessionId, currentTitle) => {
    const { value: newTitle } = await Swal.fire({
      title: "Rename conversation",
      input: "text",
      inputValue: currentTitle || "",
      inputPlaceholder: "e.g. Career Direction Doubt",
      showCancelButton: true,
      confirmButtonText: "Save",
      background: "var(--bg-elevated)",
      color: "var(--text-primary)",
    });
    if (!newTitle || !newTitle.trim()) return;
    try {
      await axios.patch(`${REACT_APP_API_URL}/api/conversations/${sessionId}`, { title: newTitle.trim() });
      refreshConversations();
      toast.success("Renamed");
    } catch (err) {
      console.error(err);
      toast.error("Could not rename");
    }
  };

  const deleteConversation = async (sessionId, title) => {
    const result = await Swal.fire({
      title: `Delete "${title}"?`,
      text: "All messages in this conversation will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "var(--error)",
      background: "var(--bg-elevated)",
      color: "var(--text-primary)",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${REACT_APP_API_URL}/api/conversations/${sessionId}`);
      // If we deleted the active session, start a new one.
      if (sessionId === currentSessionId) {
        startNewConversation();
      } else {
        refreshConversations();
      }
      toast.success("Conversation deleted");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete");
    }
  };

  // Deeplink support: /chat?s=<sessionId> switches to that session on mount.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shared = params.get("s");
    if (shared && shared !== currentSessionId) {
      switchToSession(shared);
      // Clean the URL so refreshing the tab doesn't force-switch again.
      const cleaned = new URLSearchParams(location.search);
      cleaned.delete("s");
      const q = cleaned.toString();
      navigate(`${location.pathname}${q ? `?${q}` : ""}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const startNewConversation = () => {
    playSound("tap");
    const fresh = generateTempId();
    localStorage.setItem("current_session_id", fresh);
    setCurrentSessionId(fresh);
    setChats([]);
    setVisibleChats(3);
    setInput("");
    setEditingChatId(null);
    setEditText("");
    setSelectedTheme(null);
    setThemeData(null);
    setShowThemeSection(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Refresh sidebar so a just-deleted or newly-started session reflects immediately.
    refreshConversations();
    toast.info("Started a new conversation 🙏", { autoClose: 1600 });
  };
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
    playSound("start");
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
              playSound("stop");
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
          playSound("stop");
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognition.onerror = (event) => {
          console.error("Web Speech recognition error:", event.error);
          playSound("stop");
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

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!input.trim() || loading) return;
    playSound("send");
    setLoading(true);
    setShowSkeleton(true);
    const tempId = generateTempId();
    // Capture the session this submit belongs to. If the user switches sessions
    // while the AI is thinking, we must not paste the response into the new session.
    const submittedSessionId = currentSessionId;
    const submittedInput = input;

    const tempChat = {
      _id: tempId,
      userMessage: input,
      botResponse: "...loading...",
      createdAt: new Date(),
      sessionId: submittedSessionId,
    };
    // Use functional update so we always prepend onto the freshest chats,
    // not a value captured from a stale render.
    setChats((prev) => [tempChat, ...prev]);

    setVisibleChats(3);

    try {
      const res = await axios.post(`${REACT_APP_API_URL}/api/message`, {
        message: submittedInput,
        chatHistory: chats.slice(0, 10),
        sessionId: submittedSessionId,
      });
      playSound("response");

      const newChat = {
        _id: res?.data._id,
        userMessage: submittedInput,
        botResponse: res?.data.botResponse,
        hindiResponse: res?.data.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है",
        shloka: res?.data.shloka,
        translation: res?.data.translation,
        chapter: res?.data.chapter,
        verse: res?.data.verse,
        sessionId: submittedSessionId,
        createdAt: new Date(),
      };

      // Only apply the result if the user is still viewing the same session.
      // Otherwise, drop the temp chat and skip UI side-effects; the message is
      // still saved server-side and will appear if they switch back.
      if (currentSessionId === submittedSessionId) {
        setChats((prevChats) => prevChats.map((chat) => (chat._id === tempId ? newChat : chat)));
        setVisibleChats(3);
      } else {
        setChats((prevChats) => prevChats.filter((chat) => chat._id !== tempId));
      }
      refreshConversations();

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
      // Remove the temp chat if there was an error, and clamp visibleChats
      // to the freshest length rather than a stale closure value.
      setChats((prevChats) => {
        const filtered = prevChats.filter((chat) => chat._id !== tempId);
        setVisibleChats(Math.min(3, filtered.length));
        return filtered;
      });
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
        conversations={conversations}
        currentSessionId={currentSessionId}
        switchToSession={switchToSession}
        startNewConversation={startNewConversation}
        renameConversation={renameConversation}
        deleteConversation={deleteConversation}
        scrollToChat={scrollToChat}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        styles={styles}
        playSound={playSound}
        formatTimestamp={formatTimestamp}
      />
      {/* <div style={styles.paper
    } */}

      {/* Off-screen render surface for share-card image capture */}
      {shareCardChat && (
        <div style={{ position: "fixed", left: "-10000px", top: 0, pointerEvents: "none", opacity: 1 }} aria-hidden="true">
          <ShareCardRenderer ref={shareCardRef} chat={shareCardChat} />
        </div>
      )}

      <div className="container">
        <div className="paper">

          <button
            style={{
              ...styles.logoutbutton,
              position: "fixed",
            }}
            onClick={() => navigate("/account-settings")}
            title="Account settings"
            aria-label="Account settings"
          >
            <FaUserCircle />
          </button>

          {favorites.length > 0 && (
            <button
              onClick={() => {
                // Exit select mode + drop any staged selection when switching views
                // to prevent stale selection keys from acting on the wrong list.
                setSelectMode(false);
                setSelectedChats({});
                setShowFavorites(!showFavorites);
              }}
              title={showFavorites ? "Hide favorites" : `Show ${favorites.length} favorite${favorites.length === 1 ? "" : "s"}`}
              aria-label="Toggle favorites"
              style={{
                position: "fixed",
                right: "70px",
                top: "16px",
                height: "44px",
                minWidth: "44px",
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: showFavorites ? "var(--grad-gold)" : "var(--grad-glass)",
                color: showFavorites ? "#1a0f00" : "var(--gold-bright)",
                border: `1px solid ${showFavorites ? "rgba(255,220,150,0.4)" : "var(--border-strong)"}`,
                borderRadius: "var(--r-full)",
                boxShadow: "var(--shadow-md), var(--glow-gold)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                zIndex: 900,
              }}
            >
              <FaStar />
              <span style={{ fontSize: "0.85rem", letterSpacing: "0.3px" }}>{favorites.length}</span>
            </button>
          )}
          <h1 className={`title ${fontSize}`}>
  <FaOm className={`title-icon ${fontSize}`} /> Divine Wisdom: Bhagavad Gita
</h1>

<p className={`subtitle ${fontSize}`}>
  Seek timeless guidance from Lord Krishna's teachings
</p>

<p className={`greeting ${fontSize}`}>
  {getISTGreeting()}, {displayName}! 🙏
</p>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.75rem" }}>
            <StreakPill />
          </div>

          <DailyShlokaCard onAsk={(prompt) => setInput(prompt)} />

          {chats.length === 0 && (
            <SuggestionPills onPick={(q) => setInput(q)} />
          )}

          <div className={`geeta-quote ${theme} ${fontSize}`}>
  <div style={{ marginBottom: "8px" }}>{currentQuote?.verse}</div>
  <div className={`geeta-meaning ${theme}`}>
    <div className={`geeta-meaning-text ${fontSize}`}>
      {currentQuote?.meaning}
    </div>
  </div>
</div>

          <OrnamentDivider variant="lotus" size={32} style={{ maxWidth: "500px" }} />

          <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "1.25rem 0" }}>
            <button
              className={`themes-button ${fontSize}`}
              onClick={() => setShowThemeSection(!showThemeSection)}
              aria-expanded={showThemeSection}
            >
              <FaCompass style={{ marginRight: "8px" }} />
              {showThemeSection ? "Hide Themes" : "Explore Themes"}
            </button>
          </div>

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
                  if (e.key === "Enter" && !e.shiftKey && !loading) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                autoFocus
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
              onClick={startNewConversation}
              title="Start a new conversation"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.5rem 1rem",
                background: "var(--grad-gold)",
                color: "#1a0f00",
                border: "1px solid rgba(255,220,150,0.4)",
                borderRadius: "var(--r-full)",
                fontSize: "0.85rem",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.3px",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm), var(--glow-gold)",
              }}
            >
              <FaPlus /> New
            </button>
            <button
      onClick={() => {
        playSound("toggle");
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
                  playSound("toggle");
                  setFontSize("small");
                  localStorage.setItem("fontSize", "small");
                }}
                style={{
                  ...styles.fontButton,
                  backgroundColor: fontSize === "small" ? "var(--saffron-deep)" : "var(--gold)",
                  fontSize: "0.8rem",
                }}
                title="Small Font"
              >
                A
              </button>

              <button
                onClick={() => {
                  playSound("toggle");
                  setFontSize("medium");
                  localStorage.setItem("fontSize", "medium");
                }}
                style={{
                  ...styles.fontButton,
                  backgroundColor:
                    fontSize === "medium" ? "var(--saffron-deep)" : "var(--gold)",
                  fontSize: "1.2rem",
                }}
                title="Medium Font"
              >
                A
              </button>

              <button
                onClick={() => {
                  playSound("toggle");
                  setFontSize("large");
                  localStorage.setItem("fontSize", "large");
                }}
                style={{
                  ...styles.fontButton,
                  backgroundColor: fontSize === "large" ? "var(--saffron-deep)" : "var(--gold)",
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
          {/* Sticky floating input for when the user scrolls the main hero out of view.
              Off-screen and hidden by default (opacity 0, pointerEvents none); pinned to
              the viewport bottom and revealed when `showInputWrapper` flips to false. */}
          <div
            style={{
              ...styles.inputWrap,
              position: "fixed",
              bottom: showInputWrapper ? "-100px" : "16px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(720px, 92vw)",
              zIndex: 1000,
              opacity: showInputWrapper ? 0 : 1,
              pointerEvents: showInputWrapper ? "none" : "auto",
              transition: "opacity 220ms var(--ease-out), bottom 220ms var(--ease-out)",
            }}
            aria-hidden={showInputWrapper}
          >
            <form onSubmit={handleSubmit} style={{ position: "relative", width: "100%" }}>
              <FaBookOpen style={styles.bookIcon} />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                style={styles.input}
                placeholder="Ask a question about life, dharma, karma…"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setInput("");
                }}
              />
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
                aria-label="Send"
              >
                {loading ? (
                  <FaDharmachakra style={{ animation: "spin 2s linear infinite" }} />
                ) : (
                  <FaRegPaperPlane />
                )}
              </button>
            </form>
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
              {/* Select mode operates on the regular chat list only.
                  Hiding it in favorites view avoids selection keys crossing
                  between the two lists and deleting/sharing the wrong chats. */}
              {!showFavorites && (
                <button
                  onClick={() => {
                    if (selectMode) setSelectedChats({});
                    setSelectMode(!selectMode);
                  }}
                  style={{
                    ...styles.smallButtonStyle,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {selectMode ? "Cancel" : "Select Chats"}
                </button>
              )}
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
      backgroundColor: "rgba(245, 200, 120, 0.12)",
      color: "var(--text-secondary)",
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
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div style={{
                    fontSize: "11px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}>
                    ★ Starred Wisdom
                  </div>
                  <h2 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    color: "var(--gold-bright)",
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}>
                    Your Favorite Wisdom
                  </h2>
                  <div style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginTop: "6px",
                    fontStyle: "italic",
                  }}>
                    {favorites.length} answer{favorites.length === 1 ? "" : "s"} you've saved
                  </div>
                </div>

                {favorites.map((chat, index) => (
                  <div key={chat._id || `fav-${index}`} style={styles.chatBubble}>
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
                    <div style={{ position: "relative" }}>
                      <p style={styles.botResponse}>
                        <strong>Divine Guidance:</strong>{" "}
                        {(chatLanguages[chat._id || `fav-${index}`] ||
                          "english") === "english"
                          ? chat.botResponse
                          : chat.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है"}
                      </p>
                      <button
                        onClick={() => handleCopyResponse(chat, chat._id || `fav-${index}`)}
                        title="Copy response"
                        aria-label="Copy response"
                        style={{
                          position: "absolute",
                          top: "0",
                          right: "0",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "var(--grad-glass)",
                          color: copiedChatId === (chat._id || `fav-${index}`) ? "var(--success)" : "var(--gold-bright)",
                          border: "1px solid var(--border-soft)",
                          borderRadius: "var(--r-sm)",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        {copiedChatId === (chat._id || `fav-${index}`) ? <FaCheck /> : <FaCopy />}
                      </button>
                    </div>

                    <div style={styles.languageToggle}>
                      <button
                        onClick={() => {
                          playSound("toggle");
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "english",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          background:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "var(--grad-gold)" : "transparent",
                          color:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "#1a0f00" : "var(--text-primary)",
                          borderColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "transparent" : "var(--border-strong)",
                          boxShadow:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "var(--glow-gold), var(--shadow-sm)" : "none",
                        }}
                      >
                        English
                      </button>

                      <button
                        onClick={() => {
                          playSound("toggle");
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "hindi",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          background:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "var(--grad-gold)" : "transparent",
                          color:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "#1a0f00" : "var(--text-primary)",
                          borderColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "transparent" : "var(--border-strong)",
                          boxShadow:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "var(--glow-gold), var(--shadow-sm)" : "none",
                        }}
                      >
                        हिंदी
                      </button>
                    </div>

                    {chat.shloka && (
                      <div style={styles.shlokaContainer}>
                        <p style={styles.shloka}><AnimatedShloka text={chat.shloka} /></p>
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

                      {/* Share as Image button */}
                      <button
                        onClick={() => handleShareAsImage(chat)}
                        disabled={generatingCard}
                        style={{
                          ...styles.shareButton,
                          background: "transparent",
                          color: "var(--gold-bright)",
                          border: "1.5px solid var(--gold)",
                          boxShadow: "none",
                          opacity: generatingCard ? 0.6 : 1,
                          cursor: generatingCard ? "wait" : "pointer",
                        }}
                        title="Share as beautiful image card"
                      >
                        <FaShareAlt /> {generatingCard ? "Creating…" : "Share Image"}
                      </button>

                      {/* Export PDF button */}
                      <button
                        onClick={() => handleExportPDF(chat._id)}
                        style={{
                          ...styles.shareButton,
                          background: "transparent",
                          color: "var(--text-primary)",
                          border: "1.5px solid var(--border-strong)",
                          boxShadow: "none",
                        }}
                        title="Export as PDF"
                      >
                        <FaBookOpen /> Export PDF
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ maxWidth: "500px", margin: "2rem auto 0.5rem" }}>
                  <OrnamentDivider variant="lotus" size={28} />
                  <div style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.9rem",
                    marginTop: "0.25rem",
                  }}>
                    End of your favorites
                  </div>
                </div>
              </div>
            )}

            {!showFavorites && chats?.slice(0, visibleChats).map((chat, index) => (
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
                          "var(--border-soft)"
                        }`,
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-body)",
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
                            "var(--saffron-deep)",
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
                            "var(--gold)",
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
                        color: "var(--text-secondary)",
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
                    <div style={{ position: "relative" }}>
                      <p style={styles.botResponse}>
                        <strong>Divine Guidance:</strong>{" "}
                        {(chatLanguages[chat._id || index] || "english") ===
                        "english"
                          ? chat.botResponse
                          : chat.hindiResponse || "हिंदी अनुवाद उपलब्ध नहीं है"}
                      </p>
                      <button
                        onClick={() => handleCopyResponse(chat, chat._id || index)}
                        title="Copy response"
                        aria-label="Copy response"
                        style={{
                          position: "absolute",
                          top: "0",
                          right: "0",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "var(--grad-glass)",
                          color: copiedChatId === (chat._id || index) ? "var(--success)" : "var(--gold-bright)",
                          border: "1px solid var(--border-soft)",
                          borderRadius: "var(--r-sm)",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        {copiedChatId === (chat._id || index) ? <FaCheck /> : <FaCopy />}
                      </button>
                    </div>

                    <div style={styles.languageToggle}>
                      <button
                        onClick={() => {
                          playSound("toggle");
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "english",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          background:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "var(--grad-gold)" : "transparent",
                          color:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "#1a0f00" : "var(--text-primary)",
                          borderColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "transparent" : "var(--border-strong)",
                          boxShadow:
                            (chatLanguages[chat._id || index] || "english") ===
                            "english"
                              ? "var(--glow-gold), var(--shadow-sm)" : "none",
                        }}
                      >
                        English
                      </button>

                      <button
                        onClick={() => {
                          playSound("toggle");
                          setChatLanguages((prev) => ({
                            ...prev,
                            [chat._id || index]: "hindi",
                          }));
                        }}
                        style={{
                          ...styles.languageButton,
                          background:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "var(--grad-gold)" : "transparent",
                          color:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "#1a0f00" : "var(--text-primary)",
                          borderColor:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "transparent" : "var(--border-strong)",
                          boxShadow:
                            (chatLanguages[chat._id || index] || "english") ===
                            "hindi"
                              ? "var(--glow-gold), var(--shadow-sm)" : "none",
                        }}
                      >
                        हिंदी
                      </button>
                    </div>
                    {chat.shloka && (
                      <div style={styles.shlokaContainer}>
                        <p style={styles.shloka}><AnimatedShloka text={chat.shloka} /></p>
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

                      {/* Share as Image button */}
                      <button
                        onClick={() => handleShareAsImage(chat)}
                        disabled={generatingCard}
                        style={{
                          ...styles.shareButton,
                          background: "transparent",
                          color: "var(--gold-bright)",
                          border: "1.5px solid var(--gold)",
                          boxShadow: "none",
                          opacity: generatingCard ? 0.6 : 1,
                          cursor: generatingCard ? "wait" : "pointer",
                        }}
                        title="Share as beautiful image card"
                      >
                        <FaShareAlt /> {generatingCard ? "Creating…" : "Share Image"}
                      </button>

                      {/* Export PDF button */}
                      <button
                        onClick={() => handleExportPDF(chat._id)}
                        style={{
                          ...styles.shareButton,
                          background: "transparent",
                          color: "var(--text-primary)",
                          border: "1.5px solid var(--border-strong)",
                          boxShadow: "none",
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
            {!showFavorites && chats.length > visibleChats && (
              <button
                onClick={async () => {
                  playSound("more");
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
