import { formatLastSeen, getAvatarGradient } from "../utils/mockData";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

// Avatar — shows photo if available, else gradient initials
const Avatar = ({ username, photoUrl, size = 40 }) => {
  const isEmoji = photoUrl && photoUrl.length <= 2;
  const [from, to] = getAvatarGradient(username);

  if (photoUrl && !isEmoji) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}>
        <img src={photoUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: isEmoji ? "var(--bg-sidebar-header)" : `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: size * (isEmoji ? 0.5 : 0.38), fontWeight: 700, color: "#fff",
      cursor: "pointer", userSelect: "none",
      border: isEmoji ? "1px solid var(--border-subtle)" : "none"
    }}>
      {isEmoji ? photoUrl : (username?.[0]?.toUpperCase() ?? "?")}
    </div>
  );
};

// ChatHeader — uses formatLastSeen(contactId, isOnline) for real per-contact timestamps
const ChatHeader = ({ selectedUser, onBack, currentUserPhoto, onCall, onSearch }) => {
  const isOnline = selectedUser?.isOnline === true;
  const lastSeenText = formatLastSeen(selectedUser?._id, isOnline, selectedUser?.lastSeen);

  return (
    <div className="sticky top-0 z-20 flex h-[60px] items-center gap-3 px-4"
      style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>

      {onBack && (
        <button type="button" onClick={onBack}
          className="flex items-center justify-center rounded-full p-1.5 transition-colors md:hidden"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          aria-label="Back">
          <BackIcon />
        </button>
      )}

      {/* Contact avatar (not current user photo) */}
      <Avatar username={selectedUser?.username} photoUrl={selectedUser?.avatar} size={40} />

      <div className="flex flex-1 flex-col justify-center min-w-0">
        <p className="truncate font-bold leading-tight" style={{ color: "var(--text-primary)", fontSize: "15px" }}>
          {selectedUser?.isGroup ? selectedUser?.name : selectedUser?.username ?? ""}
          {selectedUser?.isGroup && selectedUser?.members?.length ? (
            <span className="font-normal" style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
              {" "}
              · {selectedUser.members.length} members
            </span>
          ) : null}
        </p>
        {selectedUser?.isGroup ? (
          <p className="text-xs leading-tight truncate" style={{ color: "var(--text-secondary)" }}>
            Group chat
          </p>
        ) : isOnline ? (
          <p className="flex items-center gap-1.5 text-xs leading-tight" style={{ color: "#00a884" }}>
            <span className="animate-pulse-dot" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#00a884", flexShrink: 0 }} />
            online
          </p>
        ) : (
          <p className="text-xs leading-tight truncate" style={{ color: "var(--text-secondary)" }}>
            {lastSeenText}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {[
          { Icon: VideoIcon, label: "Video call", type: "video" }, 
          { Icon: PhoneIcon, label: "Call", type: "voice" }, 
          { Icon: SearchIcon, label: "Search", type: "search" }
        ].map(({ Icon, label, type }) => (
          <button key={label} type="button" aria-label={label}
            onClick={() => {
              if (type === "search") onSearch?.();
              else if (type && !selectedUser?.isGroup && !selectedUser?.isCommunity) onCall?.(type);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style={{ 
              color: "var(--text-secondary)",
              opacity: (type !== "search" && type && (selectedUser?.isGroup || selectedUser?.isCommunity)) ? 0.4 : 1,
              cursor: (type !== "search" && type && (selectedUser?.isGroup || selectedUser?.isCommunity)) ? "not-allowed" : "pointer"
            }}
            onMouseEnter={e => { if (!(type !== "search" && type && (selectedUser?.isGroup || selectedUser?.isCommunity))) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
            onMouseLeave={e => { if (!(type !== "search" && type && (selectedUser?.isGroup || selectedUser?.isCommunity))) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}>
            <Icon />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatHeader;
