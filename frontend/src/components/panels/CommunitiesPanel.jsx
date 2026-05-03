import { useState } from "react";

const AnnouncementIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const MOCK_COMMUNITIES = [
  {
    id: "c1",
    name: "Tech Enthusiasts",
    description: "A space for all things tech, coding, and gadgets.",
    groups: 12,
    unread: 2,
    avatar: "💻"
  },
  {
    id: "c2",
    name: "Apartment Residents",
    description: "Official community for our building updates.",
    groups: 5,
    unread: 0,
    avatar: "🏢"
  },
  {
    id: "c3",
    name: "Photography Hub",
    description: "Sharing the best shots and tips.",
    groups: 8,
    unread: 5,
    avatar: "📸"
  }
];

const CommunitiesPanel = ({ onSelectAnnouncement }) => {
  const [view, setView] = useState("list"); // 'list' or 'empty'

  const handleSelect = (c) => {
    onSelectAnnouncement?.({
      _id: c.id,
      username: c.name + " (Announcements)",
      isGroup: true,
      isCommunity: true,
      avatar: c.avatar,
      description: c.description
    });
  };

  if (view === "empty") {
    return (
      <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 20px", background: "var(--bg-sidebar-header)", borderBottom: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Communities</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
            <img 
              src="/community_illustration.png" 
              alt="Community" 
              style={{ width: 240, height: "auto", marginBottom: 20, borderRadius: 20, opacity: 0.9 }} 
            />
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Introducing Communities</h2>
              <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: 340, lineHeight: 1.6 }}>
                Easily organize your related groups and send announcements. Now, your communities, like neighborhoods or schools, can have their own space.
              </p>
            </div>
            <button 
              onClick={() => setView("list")}
              style={{ padding: "10px 32px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "24px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              Start your community
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 20px", background: "var(--bg-sidebar-header)", borderBottom: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Communities</span>
        </div>
        
        <div className="scrollbar-wa" style={{ flex: 1, overflowY: "auto" }}>
          {/* New Community Button */}
          <div style={{ padding: "12px 16px", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 }}>
                +
              </div>
              <span style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 500 }}>New community</span>
            </div>
          </div>

          <div style={{ height: 10, background: "var(--bg-chat)", margin: "8px 0" }} />

          {/* List of Communities */}
          {MOCK_COMMUNITIES.map(c => (
            <div key={c.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ padding: "12px 16px", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "1px solid var(--border-subtle)" }}>
                    {c.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 600 }}>{c.name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                      {c.groups} groups
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements subgroup (standard WhatsApp style) */}
              <div 
                style={{ padding: "8px 16px 12px 72px", cursor: "pointer" }} 
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"} 
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => handleSelect(c)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ color: "var(--accent)" }}>
                    <AnnouncementIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 15, color: "var(--text-primary)" }}>Announcements</span>
                      {c.unread > 0 && (
                        <span style={{ background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                      {c.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPanel;
