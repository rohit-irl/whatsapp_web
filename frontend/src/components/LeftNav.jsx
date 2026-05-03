// LeftNav — accepts profilePhoto prop (base64 or URL) for the avatar at the bottom
const NAV_ITEMS = [
  { id: "chats", label: "Chats", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" /></svg> },
  { id: "status", label: "Status", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg> },
  { id: "communities", label: "Communities", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg> },
  { id: "calls", label: "Calls", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg> },
  { id: "archived", label: "Archived", icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" /></svg> },
];

const NavAvatar = ({ username, photoUrl, onClick }) => {
  if (photoUrl) {
    return (
      <div onClick={onClick} style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}>
        <img src={photoUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div onClick={onClick} style={{
      width: 38, height: 38, borderRadius: "50%",
      background: "linear-gradient(135deg, #00a884, #007d5e)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", userSelect: "none",
    }}>
      {username?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

const LeftNav = ({ activePanel, onPanelChange, currentUser, profilePhoto, onSettingsClick }) => {
  return (
    <nav style={{
      width: 72, minWidth: 72, height: "100%", background: "var(--bg-nav)",
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingTop: 10, paddingBottom: 10, flexShrink: 0,
      borderRight: "1px solid var(--border-nav)", zIndex: 10,
    }}>
      {/* Top: current user avatar — clicking opens settings > profile */}
      <div style={{ marginBottom: 16 }}>
        <NavAvatar username={currentUser?.username} photoUrl={profilePhoto} onClick={onSettingsClick} />
      </div>

      {/* Nav icons */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = activePanel === id;
          return (
            <button key={id} onClick={() => onPanelChange(id)} title={label} aria-label={label}
              style={{
                position: "relative", width: "100%", height: 50, border: "none",
                background: isActive ? "var(--nav-active)" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                borderLeft: isActive ? "3px solid #00a884" : "3px solid transparent",
                color: isActive ? "var(--nav-icon-active)" : "var(--nav-icon)",
                transition: "background 120ms, color 120ms",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--nav-hover)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Bottom: settings icon */}
      <button onClick={onSettingsClick} title="Settings" aria-label="Settings"
        style={{
          position: "relative", width: "100%", height: 50, border: "none",
          background: activePanel === "settings" ? "var(--nav-active)" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          borderLeft: activePanel === "settings" ? "3px solid #00a884" : "3px solid transparent",
          color: activePanel === "settings" ? "var(--nav-icon-active)" : "var(--nav-icon)",
          transition: "background 120ms, color 120ms",
        }}
        onMouseEnter={e => { if (activePanel !== "settings") e.currentTarget.style.background = "var(--nav-hover)"; }}
        onMouseLeave={e => { if (activePanel !== "settings") e.currentTarget.style.background = "transparent"; }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      </button>
    </nav>
  );
};

export default LeftNav;
