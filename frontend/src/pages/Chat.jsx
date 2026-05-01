import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import ChatWindow from "../components/ChatWindow";
import LeftNav from "../components/LeftNav";
import Sidebar from "../components/Sidebar";
import ArchivedPanel from "../components/panels/ArchivedPanel";
import CallsPanel from "../components/panels/CallsPanel";
import CommunitiesPanel from "../components/panels/CommunitiesPanel";
import StarredPanel from "../components/panels/StarredPanel";
import StatusPanel from "../components/panels/StatusPanel";
import SettingsPanel from "../components/settings/SettingsPanel";
import useSocket from "../hooks/useSocket";
import {
  LS_ACTIVE_KEY,
  LS_CHATS_KEY,
  loadPersistedActiveChat,
  loadPersistedChats,
  loadProfile,
  MSG_STATUS,
  saveLastSeen,
} from "../utils/mockData";

const Chat = () => {
  const socket = useSocket();

  // ── Current user (lazy) ───────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("chat_user")); } catch { return null; }
  });

  // ── Profile photo — loaded from localStorage profile ──
  const [profilePhoto, setProfilePhoto] = useState(() => loadProfile()?.photoBase64 || null);

  const [allChats, setAllChats] = useState(() => loadPersistedChats());
  const [selectedUser, setSelectedUser] = useState(() => loadPersistedActiveChat());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [mobileChatOpen, setMobileChatOpen] = useState(() => !!loadPersistedActiveChat());
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activePanel, setActivePanel] = useState("chats");

  // ── Persist chats & active contact ───────────────────
  useEffect(() => { try { localStorage.setItem(LS_CHATS_KEY, JSON.stringify(allChats)); } catch {} }, [allChats]);
  useEffect(() => {
    if (selectedUser) localStorage.setItem(LS_ACTIVE_KEY, JSON.stringify(selectedUser));
    else localStorage.removeItem(LS_ACTIVE_KEY);
  }, [selectedUser]);

  // ── Socket ────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !currentUser?._id) return;
    socket.emit("join", currentUser._id);
  }, [socket, currentUser?._id]);

  // ── Save lastSeen for each contact when they are selected
  //    (simulates "last seen" for that contact going offline at the moment we select them)
  //    On tab/window close, save lastSeen for all contacts
  useEffect(() => {
    const contacts = Object.keys(allChats);
    const handleUnload = () => { contacts.forEach(id => saveLastSeen(id)); };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [allChats]);

  // Save lastSeen when a contact's chat is opened (they "went offline" at that time for demo)
  const touchContactLastSeen = (userId) => {
    // Only write if not already set (first visit)
    const key = `wa_lastseen_${userId}`;
    if (!localStorage.getItem(key)) saveLastSeen(userId);
  };

  // ── Messages ──────────────────────────────────────────
  const activeMessages = selectedUser
    ? [...(allChats[selectedUser._id] || [])].sort(
        (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
      )
    : [];

  const fetchMessages = async (user) => {
    if (!currentUser?._id || !user?._id || user?.isMock) return;
    try {
      setLoadingMessages(true);
      const { data } = await api.get(`/messages/${currentUser._id}/${user._id}`);
      setAllChats(p => ({ ...p, [user._id]: data }));
    } catch {} finally { setLoadingMessages(false); }
  };

  useEffect(() => {
    if (!currentUser?._id || !selectedUser?._id || selectedUser?.isMock) return;
    const poll = async () => {
      try {
        const { data } = await api.get(`/messages/${currentUser._id}/${selectedUser._id}`);
        setAllChats(p => ({ ...p, [selectedUser._id]: data }));
      } catch {}
    };
    const id = setInterval(poll, 6000);
    return () => clearInterval(id);
  }, [selectedUser?._id, selectedUser?.isMock, currentUser?._id]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMobileChatOpen(true);
    setUnreadCounts(p => ({ ...p, [user._id]: 0 }));
    setAllChats(p => ({ ...p, [user._id]: p[user._id] || [] }));
    touchContactLastSeen(user._id);
    await fetchMessages(user);
  };

  const handleMessageSent = (msg) => {
    const cid = typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver;
    setAllChats(p => { const ex = p[cid]||[]; return ex.some(m=>m._id===msg._id) ? p : { ...p, [cid]: [...ex, msg] }; });
  };

  const handleReceiveMessage = (msg) => {
    const cid = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    setAllChats(p => { const ex = p[cid]||[]; return ex.some(m=>m._id===msg._id) ? p : { ...p, [cid]: [...ex, msg] }; });
    if (cid !== selectedUser?._id) setUnreadCounts(p => ({ ...p, [cid]: (p[cid]||0)+1 }));
  };

  const handleUpdateMessageStatus = (msgId, status) => {
    setAllChats(p => {
      const up = { ...p };
      for (const cid in up) up[cid] = up[cid].map(m => m._id===msgId ? { ...m, status } : m);
      return up;
    });
  };

  const handleClearUnread = (cid) => setUnreadCounts(p => ({ ...p, [cid]: 0 }));

  // ── Profile save callback from SettingsPanel ──────────
  const handleProfileSave = (profile) => {
    if (profile.photoBase64) setProfilePhoto(profile.photoBase64);
    if (profile.name && currentUser) {
      const updated = { ...currentUser, username: profile.name };
      setCurrentUser(updated);
      localStorage.setItem("chat_user", JSON.stringify(updated));
    }
  };

  if (!localStorage.getItem("chat_user")) return <Navigate to="/" replace />;

  const renderPanel = () => {
    switch (activePanel) {
      case "calls":       return <CallsPanel />;
      case "communities": return <CommunitiesPanel />;
      case "status":      return <StatusPanel />;
      case "starred":     return <StarredPanel />;
      case "archived":    return <ArchivedPanel />;
      case "settings":    return <SettingsPanel currentUser={currentUser} onBack={() => setActivePanel("chats")} onProfileSave={handleProfileSave} />;
      default: return (
        <>
          <div className={`h-full w-full md:flex md:w-auto ${mobileChatOpen ? "hidden" : "flex"}`} style={{ flexShrink: 0 }}>
            <Sidebar currentUser={currentUser} selectedUser={selectedUser}
              onSelectUser={handleSelectUser} unreadCounts={unreadCounts}
              onClearUnread={handleClearUnread} profilePhoto={profilePhoto} />
          </div>
          <div className={`relative h-full w-full flex-1 md:flex ${mobileChatOpen ? "flex" : "hidden"}`} style={{ minWidth: 0 }}>
            {loadingMessages && selectedUser && (
              <div className="absolute left-1/2 top-[68px] z-50 -translate-x-1/2 rounded-full px-3 py-1 text-xs shadow"
                style={{ background:"rgba(255,255,255,0.9)", color:"var(--text-secondary)", border:"1px solid var(--border-subtle)" }}>
                Loading messages…
              </div>
            )}
            <ChatWindow currentUser={currentUser} selectedUser={selectedUser}
              messages={activeMessages} onMessageSent={handleMessageSent}
              onReceiveMessage={handleReceiveMessage} onUpdateMessageStatus={handleUpdateMessageStatus}
              onBack={() => setMobileChatOpen(false)} />
          </div>
        </>
      );
    }
  };

  return (
    <main className="flex h-screen overflow-hidden"
      style={{ background:"var(--bg-chat)", fontFamily:"'Nunito','Segoe UI',sans-serif" }}>
      <LeftNav activePanel={activePanel} onPanelChange={setActivePanel}
        currentUser={currentUser} profilePhoto={profilePhoto}
        onSettingsClick={() => setActivePanel("settings")} />

      <div key={activePanel} className="animate-panel-fade flex flex-1 overflow-hidden" style={{ minWidth: 0 }}>
        {renderPanel()}
      </div>
    </main>
  );
};

export default Chat;
