import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatTimestamp, getAvatarGradient, LS_ACTIVE_KEY, MOCK_CONTACTS } from "../utils/mockData";

// ── Icons ─────────────────────────────────────────────────
const SearchIcon = ({ color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={color}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);
const CommunitiesIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const NewChatIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm2.999-3.994H7.041V7.105h9.974v1.945z" />
  </svg>
);
const KebabIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);
// Double tick (delivered)
const DoubleTickIcon = ({ blue }) => (
  <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
    <path d="M1 9l4 4L15 3" stroke={blue ? "#53bdeb" : "#8696a0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 9l4 4" stroke={blue ? "#53bdeb" : "#8696a0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Avatar ─────────────────────────────────────────────────
const Avatar = ({ username, photoUrl, size = 46 }) => {
  if (photoUrl) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
      <img src={photoUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  const [from, to] = getAvatarGradient(username);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: size * 0.38, fontWeight: 700, color: "#fff", userSelect: "none",
    }}>
      {username?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

// ── Unread badge ──────────────────────────────────────────
const UnreadBadge = ({ count }) => count ? (
  <span className="animate-badge-pop" style={{
    background: "var(--accent)", color: "#fff",
    fontSize: 11, fontWeight: 700, minWidth: 18, height: 18,
    borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 5px", flexShrink: 0,
  }}>{count > 99 ? "99+" : count}</span>
) : null;

// ── Header icon button ─────────────────────────────────────
const IconBtn = ({ children, label, onClick }) => (
  <button type="button" aria-label={label} onClick={onClick}
    style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0, transition: "background 120ms" }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
    {children}
  </button>
);

// ── Kebab dropdown ────────────────────────────────────────
const KebabMenu = ({ onLogout, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const items = [{ label: "New group" }, { label: "Profile" }, { label: "Archived" }];
  return (
    <div ref={ref} style={{
      position: "absolute", right: 8, top: 52, zIndex: 60, minWidth: 180,
      background: "var(--bg-sidebar)", border: "1px solid var(--border-subtle)",
      borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", overflow: "hidden",
    }}>
      {items.map(({ label }) => (
        <button key={label} type="button" onClick={onClose}
          style={{ display: "block", width: "100%", textAlign: "left", padding: "13px 20px", border: "none", background: "transparent", fontSize: 14, color: "var(--text-primary)", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {label}
        </button>
      ))}
      <div style={{ height: 1, background: "var(--border-subtle)", margin: "2px 0" }} />
      <button type="button" onClick={onLogout}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "13px 20px", border: "none", background: "transparent", fontSize: 14, color: "#f15c6d", cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <LogoutIcon /> Log out
      </button>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────
const Sidebar = ({ currentUser, selectedUser, onSelectUser, unreadCounts = {}, onClearUnread, profilePhoto }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showKebab, setShowKebab] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("chat_user");
    localStorage.removeItem(LS_ACTIVE_KEY);
    navigate("/");
  };

  useEffect(() => {
    const load = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        const { data } = await api.get("/users");
        const filtered = data.filter(u => u._id !== currentUser._id).map(u => ({ ...u, isOnline: false }));
        setUsers(filtered.length > 0 ? filtered : MOCK_CONTACTS);
      } catch { setUsers(MOCK_CONTACTS); } finally { setLoading(false); }
    };
    load();
  }, [currentUser?._id]);

  const handleSelectUser = (user) => { onClearUnread?.(user._id); onSelectUser(user); };
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  const hasUnread = filteredUsers.some(u => (unreadCounts[u._id] || 0) > 0);

  return (
    <aside className="relative flex h-full flex-col"
      style={{ width: 360, minWidth: 300, maxWidth: 400, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-subtle)", flexShrink: 0 }}>

      {/* ── Header ──────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-4" style={{ height: 59, background: "var(--bg-sidebar-header)", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        {/* Left: current user avatar */}
        <div style={{ cursor: "pointer" }} onClick={() => {}}>
          {profilePhoto
            ? <img src={profilePhoto} alt="me" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            : <Avatar username={currentUser?.username} size={40} />
          }
        </div>
        {/* Right: 3 icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconBtn label="Communities"><CommunitiesIcon /></IconBtn>
          <IconBtn label="New chat"><NewChatIcon /></IconBtn>
          <IconBtn label="Menu" onClick={() => setShowKebab(v => !v)}><KebabIcon /></IconBtn>
        </div>
        {showKebab && <KebabMenu onLogout={handleLogout} onClose={() => setShowKebab(false)} />}
      </div>

      {/* ── Search bar ──────────────────────────────── */}
      <div style={{ padding: "8px 12px", background: "var(--bg-sidebar)", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: searchFocused ? "var(--bg-sidebar-header)" : "var(--bg-input)",
          borderRadius: 8, padding: "0 12px", height: 35,
          border: searchFocused ? "1px solid var(--accent)" : "1px solid transparent",
          transition: "background 200ms, border 200ms",
        }}>
          <span style={{ color: searchFocused ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0, display: "flex" }}>
            <SearchIcon />
          </span>
          <input ref={searchRef} type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search or start new chat"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--text-primary)", caretColor: "var(--accent)" }} />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", padding: 2 }}>
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* ── Contact list ────────────────────────────── */}
      <div className="scrollbar-wa flex-1 overflow-y-auto" style={{ background: "var(--bg-sidebar)" }}>

        {/* Unread section label */}
        {hasUnread && !searchQuery && (
          <div style={{ padding: "6px 16px 2px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Unread
          </div>
        )}

        {loading && <p style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Loading chats…</p>}
        {!loading && filteredUsers.length === 0 && (
          <p style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>No chats found</p>
        )}

        {filteredUsers.map((user, idx) => {
          const isActive = selectedUser?._id === user._id;
          const unread = unreadCounts[user._id] || 0;
          const isLast = idx === filteredUsers.length - 1;
          // Last message from allChats — for tick display
          const hasSent = false; // placeholder; wire if needed

          return (
            <button key={user._id} type="button" onClick={() => handleSelectUser(user)}
              style={{
                display: "flex", alignItems: "center", width: "100%",
                padding: "0 16px", height: 72, border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? "var(--bg-active)" : "transparent",
                transition: "background 150ms",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive ? "var(--bg-active)" : "transparent"; }}>

              {/* Avatar */}
              <Avatar username={user.username} size={49} />

              {/* Content + partial divider */}
              <div style={{
                flex: 1, minWidth: 0, marginLeft: 12,
                borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
              }}>
                {/* Row 1: name + timestamp */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {user.username}
                  </span>
                  <span style={{ fontSize: 11, color: unread ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0, whiteSpace: "nowrap" }}>
                    {formatTimestamp(user.lastMessageTime || new Date())}
                  </span>
                </div>

                {/* Row 2: preview + badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {user.lastMessage ?? "Tap to start chatting"}
                  </span>
                  {unread > 0 ? <UnreadBadge count={unread} /> : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
