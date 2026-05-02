import { useEffect, useState } from "react";
import api from "../../api/axios";
import { getAvatarGradient } from "../../utils/mockData";

const Avatar = ({ username, photoUrl, size = 44 }) => {
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
      }}
    >
      {username?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

const ArchivedPanel = ({ currentUser, onOpenChat, onBack }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/chats/archived?forUserId=${currentUser._id}`);
      setUsers(data.users || []);
      setGroups(data.groups || []);
    } catch {
      setUsers([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentUser?._id]);

  const unarchive = async (row, isGroup) => {
    try {
      await api.put(`/chats/archive/${row._id}`, {
        userId: currentUser._id,
        kind: isGroup ? "group" : "user",
      });
      await load();
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)", flex: 1 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 16px",
            background: "var(--bg-sidebar-header)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {onBack && (
            <button type="button" onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}>
              ←
            </button>
          )}
          <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Archived chats</span>
        </div>

        <div className="scrollbar-wa flex-1 overflow-y-auto">
          {loading && (
            <p style={{ padding: 24, color: "var(--text-secondary)" }}>Loading…</p>
          )}
          {!loading && users.length === 0 && groups.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗃️</div>
              No archived chats
            </div>
          )}

          {groups.map((g) => (
            <div
              key={g._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <button type="button" onClick={() => onOpenChat({ ...g, isGroup: true, name: g.name })} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}>
                <Avatar username={g.name} photoUrl={g.avatar} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Group · {g.members?.length || 0} members</div>
                </div>
              </button>
              <button type="button" onClick={() => unarchive(g, true)} style={{ fontSize: 12, color: "var(--accent)" }}>
                Unarchive
              </button>
            </div>
          ))}

          {users.map((u) => (
            <div
              key={u._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <button type="button" onClick={() => onOpenChat(u)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}>
                <Avatar username={u.username} photoUrl={u.avatar} />
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{u.username}</div>
              </button>
              <button type="button" onClick={() => unarchive(u, false)} style={{ fontSize: 12, color: "var(--accent)" }}>
                Unarchive
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchivedPanel;
