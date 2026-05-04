import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../api/axios";
import { formatTimestamp, MSG_STATUS } from "../utils/mockData";

/* ── Tick icons ── */
const SingleTick = () => (
  <svg viewBox="0 0 12 11" width="14" height="11" fill="var(--tick-gray)">
    <path d="M11.071.653a.45.45 0 0 0-.637 0L4.916 6.171 2.566 3.82a.45.45 0 0 0-.637.638L4.598 7.128a.45.45 0 0 0 .637 0l5.836-5.836a.45.45 0 0 0 0-.639z" />
  </svg>
);
const DoubleTickGray = () => (
  <svg viewBox="0 0 16 11" width="16" height="11" fill="var(--tick-gray)">
    <path d="M11.071.653a.45.45 0 0 0-.637 0L4.916 6.171 2.566 3.82a.45.45 0 0 0-.637.638L4.598 7.13a.45.45 0 0 0 .637 0l5.836-5.836a.45.45 0 0 0 0-.641z" />
    <path d="M15.071.653a.45.45 0 0 0-.637 0L8.916 6.171l-.956-.955a.45.45 0 0 0-.637.638l1.274 1.274a.45.45 0 0 0 .637 0l5.837-5.834a.45.45 0 0 0 0-.641z" />
  </svg>
);
const DoubleTickBlue = () => (
  <svg viewBox="0 0 16 11" width="16" height="11" fill="var(--tick-blue)">
    <path d="M11.071.653a.45.45 0 0 0-.637 0L4.916 6.171 2.566 3.82a.45.45 0 0 0-.637.638L4.598 7.13a.45.45 0 0 0 .637 0l5.836-5.836a.45.45 0 0 0 0-.641z" />
    <path d="M15.071.653a.45.45 0 0 0-.637 0L8.916 6.171l-.956-.955a.45.45 0 0 0-.637.638l1.274 1.274a.45.45 0 0 0 .637 0l5.837-5.834a.45.45 0 0 0 0-.641z" />
  </svg>
);

const TickIcon = ({ status }) => {
  switch (status) {
    case MSG_STATUS.DELIVERED: return <DoubleTickGray />;
    case MSG_STATUS.SEEN: return <DoubleTickBlue />;
    default: return <SingleTick />;
  }
};

const fmtSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const WavePlaceholder = ({ durationSec }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32, marginBottom: 6, padding: "0 4px" }}>
    {Array.from({ length: 24 }).map((_, i) => (
      <div key={i} style={{ width: 3, height: `${8 + ((i * 17) % 24)}px`, borderRadius: 1, background: "var(--accent)", opacity: 0.35 + (i % 5) * 0.1 }} />
    ))}
    <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-secondary)", alignSelf: "center", whiteSpace: "nowrap" }}>
      {durationSec > 0
        ? `${Math.floor(durationSec / 60)}:${String(Math.floor(durationSec % 60)).padStart(2, "0")}`
        : "—:--"}
    </span>
  </div>
);

const FileContent = ({ message }) => {
  const { fileType, fileName, fileSize, fileUrl } = message;
  if (fileType === "image") {
    return (
      <div style={{ marginBottom: 4, borderRadius: 8, overflow: "hidden", maxWidth: 260 }}>
        <img src={fileUrl} alt={fileName} style={{ width: "100%", display: "block", borderRadius: 8, maxHeight: 320, objectFit: "cover" }} />
      </div>
    );
  }
  if (fileType === "video") {
    return (
      <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: 8, padding: "10px 12px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, maxWidth: 260 }}>
        <span style={{ fontSize: 28 }}>🎬</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", wordBreak: "break-all" }}>{fileName}</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fmtSize(fileSize)}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 8, padding: "10px 12px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, maxWidth: 280 }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>📄</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", wordBreak: "break-all" }}>{fileName}</div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fmtSize(fileSize)}</div>
      </div>
      {fileUrl && (
        <a href={fileUrl} download={fileName} style={{ color: "var(--accent)", flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
        </a>
      )}
    </div>
  );
};

const AudioContent = ({ message }) => {
  const url = message.fileUrl;
  const dur = message.durationSec || 0;
  if (!url) return null;
  return (
    <div style={{ minWidth: 220, maxWidth: 280 }}>
      <WavePlaceholder durationSec={dur} />
      <audio controls src={url} style={{ height: 36, width: "100%", outline: "none", display: "block" }} />
    </div>
  );
};

/* ─────────────────────────────────────────
   Portal dropdown menu
───────────────────────────────────────── */
const DropdownMenu = ({ anchorEl, items, onClose, alignRight }) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999, opacity: 0 });

  useEffect(() => {
    if (!anchorEl || !menuRef.current) return;
    const ar = anchorEl.getBoundingClientRect();
    const mr = menuRef.current.getBoundingClientRect();
    let left = alignRight ? ar.right - mr.width : ar.left;
    let top = ar.bottom + 6;
    left = Math.max(8, Math.min(left, window.innerWidth - mr.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - mr.height - 8));
    setPos({ left, top, opacity: 1 });
  }, [anchorEl, alignRight]);

  useEffect(() => {
    const onMD = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    const getId = (v) => {
      if (!v) return null;
      if (typeof v === "object") return v._id || v;
      return v;
    };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onMD);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMD);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        opacity: pos.opacity,
        zIndex: 99999,
        minWidth: 210,
        borderRadius: 10,
        padding: "4px 0",
        background: "var(--bg-sidebar)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        transition: "opacity 0.12s",
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} style={{ height: 1, background: "var(--border-subtle)", margin: "3px 0" }} />
        ) : (
          <button
            key={i}
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { item.action(); onClose(); }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 16px",
              textAlign: "left", fontSize: 13.5,
              color: item.danger ? "#f15c6d" : "var(--text-primary)",
              fontWeight: item.bold ? 700 : 400,
              background: "none", border: "none", cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>,
    document.body
  );
};

/* ─────────────────────────────────────────
   MessageBubble
───────────────────────────────────────── */
const MessageBubble = ({
  message,
  isOwnMessage,
  isFirstInGroup,
  showSenderName,
  currentUserId,
  onDeleteMessage,
}) => {
  const ref = useRef(null);
  const btnRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    ref.current?.classList.add("animate-msg-in");
  }, []);

  const formattedTime = formatTimestamp(message.timestamp || message.createdAt);
  const isFile = !!message.fileType && message.type !== "audio";
  const isAudio = message.type === "audio" || message.fileType === "audio";
  const isDeleted = !!message.deletedForEveryone;

  const getId = (v) => {
    if (!v) return null;
    if (typeof v === "object") return v._id || v;
    return v;
  };

  const currSender = getId(message.sender);

  if (!currSender && !message.deletedForEveryone && !message.isMock) {
    console.warn(">>> [FRONTEND] Message hidden: no sender", message);
    return null;
  }

  const senderName = (typeof message.sender === "object" && message.sender?.username)
    ? message.sender.username : "";

  /* ── Actions ── */
  const doCopy = () => {
    const t = message.text || "";
    if (t) navigator.clipboard.writeText(t).catch(() => { });
  };

  const doDeleteForMe = async () => {
    onDeleteMessage?.(message._id, "me");
    const isMock = message.isMock || String(message._id).startsWith("mock");
    if (!isMock) {
      try { await api.patch(`/messages/delete-for-me/${message._id}`, { userId: currentUserId }); }
      catch { /* backend will filter on next poll */ }
    }
  };

  const doDeleteForEveryone = async () => {
    onDeleteMessage?.(message._id, "everyone");
    const isMock = message.isMock || String(message._id).startsWith("mock");
    if (!isMock) {
      try {
        await api.patch(`/messages/delete-for-everyone/${message._id}`, {
          userId: currentUserId,
        });
      } catch (error) {
        alert("Delete failed: " + (error?.response?.data?.message || error.message));
        console.error("Failed to delete for everyone:", error?.response?.data || error);
      }
    }
  };

  /* ── Menu items ── */
  const menuItems = [];
  if (!isDeleted) {
    if (message.text && !isAudio) {
      menuItems.push({ icon: "📋", label: "Copy text", action: doCopy });
    }
    if (menuItems.length > 0) menuItems.push({ divider: true });
    menuItems.push({ icon: "🙈", label: "Delete for me", action: doDeleteForMe, danger: true });
    if (isOwnMessage) {
      menuItems.push({ icon: "🗑", label: "Delete for everyone", action: doDeleteForEveryone, danger: true, bold: true });
    }
  }
  const canShowMenu = menuItems.length > 0;
  const showArrow = (hovered || menuOpen) && canShowMenu;

  return (
    <div
      ref={ref}
      className={`flex w-full opacity-0 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      style={{ paddingLeft: isOwnMessage ? "15%" : 0, paddingRight: isOwnMessage ? 0 : "15%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!menuOpen) setHovered(false); }}
    >
      {menuOpen && canShowMenu && (
        <DropdownMenu
          anchorEl={btnRef.current}
          items={menuItems}
          onClose={() => { setMenuOpen(false); setHovered(false); }}
          alignRight={isOwnMessage}
        />
      )}

      {/* ── Bubble ── */}
      <div
        className={`relative break-words text-sm
          ${isOwnMessage ? "rounded-2xl rounded-tr-sm bubble-tail-sent" : "rounded-2xl rounded-tl-sm bubble-tail-recv"}
          ${isFirstInGroup ? "mt-1" : "mt-0.5"}`}
        style={{
          background: isOwnMessage ? "var(--bubble-sent)" : "var(--bubble-recv)",
          color: "var(--text-primary)",
          boxShadow: "var(--shadow-bubble)",
          /* Padding: top right bottom left
             bottom needs room for the timestamp row */
          padding: "6px 10px 22px 10px",
          maxWidth: "100%",
        }}
      >
        {/* ── Hover arrow — always inside bubble, top-right corner ── */}
        {canShowMenu && (
          <button
            ref={btnRef}
            type="button"
            aria-label="Message options"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            title="Options"
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "50%",
              /* Gradient background so it's always readable over any bubble colour */
              background: menuOpen
                ? "rgba(0,0,0,0.35)"
                : showArrow
                  ? "rgba(0,0,0,0.18)"
                  : "transparent",
              border: "none",
              cursor: "pointer",
              color: menuOpen ? "#fff" : "var(--text-secondary)",
              opacity: showArrow ? 1 : 0,
              transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "opacity 0.15s, background 0.15s, transform 0.2s, color 0.15s",
              pointerEvents: showArrow ? "auto" : "none",
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        )}

        {/* Sender name (group chats) */}
        {showSenderName && senderName && !isOwnMessage && (
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 3 }}>{senderName}</div>
        )}

        {/* ── Tombstone ── */}
        {isDeleted ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontStyle: "italic", color: "var(--text-secondary)", fontSize: 13, minWidth: 190 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ flexShrink: 0, opacity: 0.55 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            This message was deleted
          </div>
        ) : (
          <>
            {isAudio && <AudioContent message={message} />}
            {isFile && <FileContent message={message} />}
            {message.type === "call" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", minWidth: 160 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: "rgba(0,168,132,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                }}>
                  {message.text.includes("Video") ? "📹" : "📞"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{message.text}</div>
                  {message.durationSec > 0 && (
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      Duration: {Math.floor(message.durationSec / 60)}:
                      {String(message.durationSec % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>
              </div>
            )}
            {message.text && !isAudio && message.type !== "call" && (
              <span
                className="block whitespace-pre-wrap leading-relaxed"
                style={{ fontSize: "14px", minWidth: 60 }}
              >
                {message.text}
              </span>
            )}
          </>
        )}

        {/* ── Timestamp + ticks — always at bottom-right, never overlapping text ── */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            color: "var(--text-secondary)",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {formattedTime}
          {isOwnMessage && !isDeleted && <TickIcon status={message.status || "sent"} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
