import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { formatStatusTime, getAvatarGradient } from "../../utils/mockData";

const MAX_BYTES = 16 * 1024 * 1024;

const Avatar = ({ username, photoUrl, size = 48, ringColor }) => {
  const inner = photoUrl ? (
    <img src={photoUrl} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
  ) : (
    (() => {
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
    })()
  );
  if (!ringColor) return inner;
  return (
    <div
      style={{
        padding: 3,
        borderRadius: "50%",
        background: ringColor,
      }}
    >
      {inner}
    </div>
  );
};

const StatusPanel = ({ currentUser, socket }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingType, setPendingType] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [idx, setIdx] = useState(0);
  const progressRef = useRef(null);

  const load = useCallback(async () => {
    const uid = currentUser?._id;
    if (!uid) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/status?userId=${uid}`);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () =>
      startTransition(() => {
        void load();
      });
    socket.on("new_status", onNew);
    return () => socket.off("new_status", onNew);
  }, [socket, load]);

  const grouped = () => {
    const map = new Map();
    for (const s of rows) {
      const uid = typeof s.userId === "object" ? s.userId._id : s.userId;
      const key = String(uid);
      if (!map.has(key)) map.set(key, { user: typeof s.userId === "object" ? s.userId : { _id: uid, username: "User" }, items: [] });
      map.get(key).items.push(s);
    }
    return [...map.values()].filter((g) => g.items.length);
  };

  const markViewed = useCallback(async (statusId) => {
    if (!currentUser?._id || !statusId) return;
    try {
      await api.put(`/status/view/${statusId}`, { userId: currentUser._id });
    } catch {
      /* ignore */
    }
  }, [currentUser]);

  const openViewer = async (group, start = 0) => {
    setViewer(group);
    setIdx(start);
    const st = group.items[start];
    if (st?._id) await markViewed(st._id);
  };

  useEffect(() => {
    if (!viewer) return;
    const st = viewer.items[idx];
    if (!st) return;
    markViewed(st._id);
    const isVideo = st.mediaType === "video";
    if (isVideo) return;
    const bar = progressRef.current;
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = "100%";
    requestAnimationFrame(() => {
      bar.style.transition = "width 5s linear";
      bar.style.width = "0%";
    });
    const t = setTimeout(() => {
      if (idx < viewer.items.length - 1) setIdx((i) => i + 1);
      else setViewer(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [viewer, idx, markViewed]);

  const shareStatus = async () => {
    if (!pendingFile || !currentUser?._id) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await api.post("/status", {
          userId: currentUser._id,
          mediaUrl: reader.result,
          mediaType: pendingType,
          caption,
        });
        setCaption("");
        setPendingFile(null);
        setPendingType(null);
        load();
      } catch {
        /* ignore */
      }
    };
    reader.readAsDataURL(pendingFile);
  };

  const handleDeleteStatus = async (statusId) => {
    if (!currentUser?._id || !statusId) return;
    if (!window.confirm("Are you sure you want to delete this status?")) return;
    try {
      await api.post(`/status/delete/${statusId}`, { userId: currentUser._id });
      setViewer(null);
      load();
    } catch (err) {
      alert("Failed to delete status: " + (err.response?.data?.message || err.message));
    }
  };

  const groups = grouped();
  const mine = groups.find((g) => String(g.user._id) === String(currentUser._id));

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
          <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Status</span>
        </div>

        <div className="scrollbar-wa flex-1 overflow-y-auto p-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => mine?.items?.length && openViewer(mine, 0)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && mine?.items?.length) openViewer(mine, 0);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 8,
              background: "var(--bg-input)",
              marginBottom: 16,
              cursor: mine?.items?.length ? "pointer" : "default",
            }}
          >
            <Avatar
              username={currentUser?.username}
              photoUrl={currentUser?.avatar}
              size={52}
              ringColor={mine?.items?.length ? "#25D366" : undefined}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>My Status</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {mine?.items?.length
                  ? `${mine.items.length} update${mine.items.length > 1 ? "s" : ""} · tap to view`
                  : "Tap + to add"}
              </div>
            </div>
            <label
              className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold text-white"
              style={{ background: "var(--accent)" }}
              onClick={(e) => e.stopPropagation()}
            >
              +
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  if (f.size > MAX_BYTES) {
                    alert("Max 16 MB");
                    return;
                  }
                  setPendingFile(f);
                  setPendingType(f.type.startsWith("video") ? "video" : "image");
                }}
              />
            </label>
          </div>

          {pendingFile && (
            <div className="mb-4 rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                {pendingFile.name} ({pendingType})
              </p>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption"
                className="mt-2 w-full rounded border px-2 py-1 text-sm"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-sidebar)", color: "var(--text-primary)" }}
              />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => { setPendingFile(null); setPendingType(null); }} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Cancel
                </button>
                <button type="button" onClick={shareStatus} className="rounded px-3 py-1 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>
                  Share
                </button>
              </div>
            </div>
          )}

          {loading && <p style={{ color: "var(--text-secondary)" }}>Loading…</p>}
          {!loading && groups.filter((g) => String(g.user._id) !== String(currentUser._id)).length === 0 && !mine && (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: 24 }}>No recent updates from contacts</p>
          )}

          {groups
            .filter((g) => String(g.user._id) !== String(currentUser._id))
            .map((g) => {
              const unseen = g.items.some((s) => !(s.views || []).some((v) => String(v) === String(currentUser._id)));
              return (
                <button
                  key={g.user._id}
                  type="button"
                  onClick={() => openViewer(g, 0)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "12px 8px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Avatar
                    username={g.user.username}
                    photoUrl={g.user.avatar}
                    ringColor={unseen ? "#25D366" : "#8696a0"}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{g.user.username}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {formatStatusTime(g.items[0]?.createdAt)} · {g.items.length} update{g.items.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {viewer && viewer.items[idx] && (
        <div
          className="fixed inset-0 z-[400] flex flex-col bg-black text-white"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewer(null);
          }}
        >
          <div className="h-1 w-full bg-white/20">
            <div ref={progressRef} className="h-full bg-[#25D366]" style={{ width: "100%" }} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-bold">{viewer.user.username}</div>
              <div className="text-xs opacity-80">{formatStatusTime(viewer.items[idx].createdAt)}</div>
            </div>
            <div className="flex items-center gap-5">
              {String(viewer.user._id) === String(currentUser._id) && (
                <button
                  type="button"
                  className="text-lg opacity-80 hover:opacity-100"
                  onClick={() => handleDeleteStatus(viewer.items[idx]._id)}
                  title="Delete Status"
                >
                  🗑️
                </button>
              )}
              <button type="button" className="text-2xl leading-none" onClick={() => setViewer(null)}>
                ×
              </button>
            </div>
          </div>
          <div
            className="relative flex flex-1 items-center justify-center"
            onClick={(e) => {
              const w = e.currentTarget.getBoundingClientRect().width;
              if (e.clientX - e.currentTarget.getBoundingClientRect().left < w / 2) {
                if (idx > 0) setIdx((i) => i - 1);
              } else if (idx < viewer.items.length - 1) {
                setIdx((i) => i + 1);
              } else {
                setViewer(null);
              }
            }}
          >
            {viewer.items[idx].mediaType === "video" ? (
              <video
                key={viewer.items[idx]._id}
                src={viewer.items[idx].mediaUrl}
                className="max-h-[80vh] max-w-full"
                autoPlay
                controls
                onEnded={() => {
                  if (idx < viewer.items.length - 1) setIdx((i) => i + 1);
                  else setViewer(null);
                }}
              />
            ) : (
              <img src={viewer.items[idx].mediaUrl} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </div>
          {viewer.items[idx].caption && (
            <div className="px-4 py-3 text-center text-sm">{viewer.items[idx].caption}</div>
          )}
          {String(viewer.user._id) === String(currentUser._id) && (
            <div className="pb-4 text-center text-xs opacity-70">
              {viewer.items[idx].views?.length || 0} view{(viewer.items[idx].views?.length || 0) !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusPanel;
