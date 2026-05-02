import { useEffect, useState } from "react";
import api from "../../api/axios";
import { getAvatarGradient } from "../../utils/mockData";

const Avatar = ({ username, photoUrl, size = 40 }) => {
  if (photoUrl) {
    return (
      <img src={photoUrl} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
    );
  }
  const [a, b] = getAvatarGradient(username);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${a}, ${b})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {username?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

const StarredPanel = ({ currentUser, onOpenMessage, refreshKey = 0 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/messages/starred?userId=${currentUser._id}`);
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?._id, refreshKey]);

  const labelFor = (msg) => {
    if (msg.groupId) {
      const g = typeof msg.groupId === "object" ? msg.groupId : null;
      return g?.name || "Group";
    }
    const s = msg.sender;
    return typeof s === "object" ? s.username : "User";
  };

  const preview = (msg) => {
    if (msg.type === "audio") return "🎤 Voice message";
    if (msg.type === "image") return "📷 Photo";
    if (msg.text) return msg.text.slice(0, 80);
    return "Message";
  };

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)", flex: 1 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            background: "var(--bg-sidebar-header)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Starred messages</span>
        </div>

        <div className="scrollbar-wa flex-1 overflow-y-auto">
          {loading && <p style={{ padding: 24, color: "var(--text-secondary)" }}>Loading…</p>}
          {!loading && items.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
              No starred messages
            </div>
          )}

          {items.map((msg) => (
            <button
              key={msg._id}
              type="button"
              onClick={() => onOpenMessage?.(msg)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                width: "100%",
                padding: "14px 16px",
                border: "none",
                borderBottom: "1px solid var(--border-subtle)",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Avatar username={labelFor(msg)} photoUrl={typeof msg.sender === "object" ? msg.sender?.avatar : null} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 15 }}>{labelFor(msg)}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{preview(msg)}</div>
              </div>
              <span style={{ fontSize: 18 }}>⭐</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarredPanel;
