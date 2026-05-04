import { useEffect, useState } from "react";
import api from "../../api/axios";

const ContactsPanel = ({ currentUser, onCall, onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setUsers(data.filter(u => u._id !== currentUser?._id));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser?._id]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      height: "100%", 
      background: "var(--bg-sidebar)",
      width: "100%",
      maxWidth: 400,
      borderRight: "1px solid var(--border-subtle)"
    }}>
      <div style={{ 
        height: 60, 
        display: "flex", 
        alignItems: "center", 
        padding: "0 20px", 
        background: "var(--bg-sidebar-header)", 
        borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0,
        gap: 20
      }}>
        <button 
          onClick={onBack}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: "var(--text-secondary)", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>New call</span>
      </div>

      <div style={{ padding: "8px 12px", background: "var(--bg-sidebar)", flexShrink: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--bg-input)",
          borderRadius: 8,
          padding: "0 12px",
          height: 35,
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--text-secondary)">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--text-primary)"
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>Loading contacts...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>No contacts found</div>
        ) : (
          filteredUsers.map(user => (
            <div key={user._id} className="contact-item" style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              gap: 12,
              cursor: "pointer",
              transition: "background 0.2s",
              borderBottom: "1px solid var(--border-subtle)"
            }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: "50%", 
                background: "#ccc", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0,
                overflow: "hidden"
              }}>
                {user.avatar ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.username}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.about || "Hey there! I am using WhatsApp."}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCall("voice", user); }}
                  className="call-btn"
                  style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", padding: 8 }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCall("video", user); }}
                  className="call-btn"
                  style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", padding: 8 }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .contact-item:hover {
          background: var(--bg-sidebar-hover);
        }
        .call-btn:hover {
          background: rgba(0, 168, 132, 0.1) !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default ContactsPanel;
