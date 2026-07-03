import { useEffect, useState } from "react";
import { FaPlus, FaBars, FaPen, FaRegTrashAlt } from "react-icons/fa";

/**
 * SideNavigation — conversation-list sidebar.
 * Extracted to module scope so its component identity is stable across parent
 * re-renders (otherwise the sidebar remounts every parent render, resetting
 * search state and killing hover menus).
 *
 * All parent-owned state is passed in as props — no closures over parent scope.
 */
const SideNavigation = ({
  chats,
  conversations,
  currentSessionId,
  switchToSession,
  startNewConversation,
  renameConversation,
  deleteConversation,
  scrollToChat,
  isOpen,
  setIsOpen,
  styles,
  playSound,
  formatTimestamp,
}) => {
  const [hoveredSession, setHoveredSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const q = searchTerm.trim().toLowerCase();
  const filteredConversations = q
    ? (conversations || []).filter((c) => `${c.title} ${c.preview}`.toLowerCase().includes(q))
    : (conversations || []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      // Don't fight modals — SweetAlert has its own Esc handler.
      if (typeof document !== "undefined" && document.querySelector(".swal2-container")) return;
      setIsOpen(false);
    };
    if (typeof window !== "undefined") window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen]);

  // Auto-close ONLY when the viewport crosses into mobile width — a desktop
  // user resizing their window shouldn't have their sidebar slam shut.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const MOBILE_MAX = 768;
    let wasNarrow = window.innerWidth < MOBILE_MAX;
    const handleResize = () => {
      const nowNarrow = window.innerWidth < MOBILE_MAX;
      if (nowNarrow && !wasNarrow) setIsOpen(false);
      wasNarrow = nowNarrow;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  return (
    <>
      <div style={styles.sidebar}>
        <button
          onClick={() => {
            playSound("tap");
            setIsOpen(false);
          }}
          title="Close sidebar"
          aria-label="Close sidebar"
          style={{
            position: "absolute",
            top: "20px",
            right: "15px",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--r-sm)",
            cursor: "pointer",
            padding: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            fontSize: "20px",
            fontWeight: "bold",
            boxShadow: "var(--shadow-sm)",
            zIndex: 1001,
          }}
        >
          ×
        </button>

        <div
          style={{
            padding: "45px 35px 20px 15px",
            textAlign: "center",
            borderBottom: "1px solid var(--border-soft)",
          }}
        >
          <div
            style={{
              color: "var(--gold-bright)",
              fontSize: "1.3rem",
              fontWeight: "600",
              fontFamily: "var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Conversation History
          </div>
        </div>

        <div style={{ padding: "10px 15px 0" }}>
          <button
            onClick={startNewConversation}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "10px 12px",
              background: "var(--grad-gold)",
              color: "#1a0f00",
              border: "1px solid rgba(255,220,150,0.4)",
              borderRadius: "var(--r-md)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.9rem",
              letterSpacing: "0.3px",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm), var(--glow-gold)",
              marginBottom: "10px",
            }}
          >
            <FaPlus /> New Conversation
          </button>
        </div>

        <div style={{ padding: "0 15px" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "var(--input-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--r-md)",
              fontSize: "0.85rem",
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-soft)")}
          />
        </div>

        <div
          style={{
            overflow: "auto",
            padding: "10px 15px 15px",
            flex: 1,
          }}
        >
          {filteredConversations.length === 0 && chats.length === 0 ? (
            <p
              style={{
                color: "var(--text-muted)",
                fontStyle: "italic",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No conversations yet
            </p>
          ) : filteredConversations.length === 0 && q ? (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "20px 0", fontSize: "0.9rem" }}>
              No matches for "{searchTerm}"
            </p>
          ) : (
            <>
              {filteredConversations.map((conv) => {
                const isActive = (conv.sessionId || null) === (currentSessionId || null);
                const isHovered = hoveredSession === (conv.sessionId || "legacy");
                return (
                  <div
                    key={conv.sessionId || "legacy"}
                    onMouseEnter={() => setHoveredSession(conv.sessionId || "legacy")}
                    onMouseLeave={() => setHoveredSession(null)}
                  >
                    <div
                      onClick={() => {
                        if (!isActive) switchToSession(conv.sessionId);
                        if (window.innerWidth < 768) setIsOpen(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--r-md)",
                        cursor: isActive ? "default" : "pointer",
                        marginBottom: "6px",
                        background: isActive ? "var(--grad-glass)" : (isHovered ? "rgba(245, 200, 120, 0.06)" : "transparent"),
                        border: `1px solid ${isActive ? "var(--border-strong)" : "transparent"}`,
                        boxShadow: isActive ? "var(--shadow-sm)" : "none",
                        transition: "background 0.15s, border 0.15s",
                        color: "var(--text-body)",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        {isActive && (
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold-bright)", boxShadow: "0 0 8px var(--gold)" }} />
                        )}
                        <div style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: isActive ? "var(--gold-bright)" : "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                        }}>
                          {conv.isLegacy ? "Earlier Wisdom" : conv.title}
                        </div>
                        {isHovered && !conv.isLegacy && conv.sessionId && (
                          <div style={{ display: "flex", gap: "4px", opacity: 0.95 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); renameConversation(conv.sessionId, conv.title); }}
                              title="Rename"
                              style={{
                                width: "24px", height: "24px", padding: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "var(--bg-elevated)", color: "var(--gold-bright)",
                                border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)",
                                cursor: "pointer", fontSize: "0.7rem",
                              }}
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.sessionId, conv.title); }}
                              title="Delete conversation"
                              style={{
                                width: "24px", height: "24px", padding: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "var(--bg-elevated)", color: "var(--error)",
                                border: "1px solid var(--border-soft)", borderRadius: "var(--r-sm)",
                                cursor: "pointer", fontSize: "0.75rem",
                              }}
                            >
                              <FaRegTrashAlt />
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: "11.5px",
                        color: "var(--text-muted)",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}>
                        <span>{conv.messageCount} message{conv.messageCount === 1 ? "" : "s"}</span>
                        <span style={{ fontStyle: "italic" }}>
                          {formatTimestamp(conv.lastMessageAt || new Date()).split("|")[0]}
                        </span>
                      </div>
                    </div>

                    {isActive && chats.length > 0 && (
                      <div style={{ paddingLeft: "12px", borderLeft: "1px solid var(--border-subtle)", marginLeft: "10px", marginBottom: "8px" }}>
                        {chats.map((chat, index) => (
                          <div
                            key={chat._id || `nav-${index}`}
                            onClick={() => {
                              playSound("tap");
                              scrollToChat(index);
                              if (window.innerWidth < 768) setIsOpen(false);
                            }}
                            style={{
                              padding: "6px 8px",
                              fontSize: "12.5px",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              borderRadius: "var(--r-sm)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(245, 200, 120, 0.05)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            · {chat.userMessage?.substring(0, 32) || "Untitled"}
                            {chat.userMessage && chat.userMessage.length > 32 ? "…" : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div
          style={{
            padding: "15px",
            borderTop: "1px solid var(--border-subtle)",
            textAlign: "center",
          }}
        />
      </div>

      {!isOpen && (
        <button
          onClick={() => {
            playSound("tap");
            setIsOpen(true);
          }}
          style={styles.opensidebarbutton}
          title="Open conversation history"
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
      )}
    </>
  );
};

export default SideNavigation;
