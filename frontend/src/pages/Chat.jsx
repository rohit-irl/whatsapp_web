import { useEffect, useRef, useState } from "react";
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
} from "../utils/mockData";

const Chat = () => {
  const socket = useSocket();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chat_user"));
    } catch {
      return null;
    }
  });

  // Use currentUser?.avatar as the primary source — it's stored in chat_user (user-scoped).
  // wa_profile is a shared key and can contain a different user's photo if they didn't fully clear storage.
  const [profilePhoto, setProfilePhoto] = useState(() => currentUser?.avatar || null);

  const [allChats, setAllChats] = useState(() => loadPersistedChats());
  const [selectedUser, setSelectedUser] = useState(() => loadPersistedActiveChat());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [mobileChatOpen, setMobileChatOpen] = useState(() => !!loadPersistedActiveChat());
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activePanel, setActivePanel] = useState("chats");
  const [scrollToMessageId, setScrollToMessageId] = useState(null);
  const [starTick, setStarTick] = useState(0);
  // Track IDs deleted "for me" locally so polling doesn't revert them
  const localDeletedIdsRef = useRef(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(LS_CHATS_KEY, JSON.stringify(allChats));
    } catch {
      /* ignore */
    }
  }, [allChats]);

  
  useEffect(() => {
    if (selectedUser) localStorage.setItem(LS_ACTIVE_KEY, JSON.stringify(selectedUser));
    else localStorage.removeItem(LS_ACTIVE_KEY);
  }, [selectedUser]);

  useEffect(() => {
    if (!socket || !currentUser?._id) return;
    socket.emit("join", currentUser._id);
  }, [socket, currentUser?._id]);

  useEffect(() => {
    if (!socket || !currentUser?._id) return;
    const onUnload = () => socket.emit("user_offline", currentUser._id);
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [socket, currentUser?._id]);

  useEffect(() => {
    if (!socket) return;
    const onProfile = ({ userId, avatar, username, about }) => {
      setSelectedUser((u) =>
        u && String(u._id) === String(userId) ? { ...u, avatar, username, ...(about != null ? { about } : {}) } : u
      );
      try {
        const raw = localStorage.getItem("chat_user");
        const me = raw ? JSON.parse(raw) : null;
        if (me && String(me._id) === String(userId)) {
          const next = { ...me, avatar, username, ...(about != null ? { about } : {}) };
          localStorage.setItem("chat_user", JSON.stringify(next));
          setCurrentUser(next);
        }
      } catch {
        /* ignore */
      }
    };
    socket.on("profile_updated", onProfile);

    // Real-time: update selectedUser's online status + lastSeen whenever any user status changes.
    // This is what drives the "last seen" text in ChatHeader — without this listener,
    // selectedUser.lastSeen is frozen at the moment the chat was opened.
    const onStatusChange = ({ userId, isOnline, lastSeen }) => {
      setSelectedUser((u) =>
        u && String(u._id) === String(userId)
          ? { ...u, isOnline, lastSeen }
          : u
      );
    };
    socket.on("user_status_change", onStatusChange);

    // Real-time: another user deleted a message for everyone → show tombstone
    const onMsgUpdated = ({ messageId, deletedForEveryone }) => {
      if (!deletedForEveryone) return;
      setAllChats((p) => {
        const up = { ...p };
        for (const cid in up)
          up[cid] = up[cid].map((m) =>
            String(m._id) === String(messageId) ? { ...m, deletedForEveryone: true, text: "", fileUrl: "", fileName: "" } : m
          );
        return up;
      });
    };
    socket.on("messageUpdated", onMsgUpdated);

    return () => {
      socket.off("profile_updated", onProfile);
      socket.off("user_status_change", onStatusChange);
      socket.off("messageUpdated", onMsgUpdated);
    };
  }, [socket]);

  const activeMessages = selectedUser
    ? [...(allChats[selectedUser._id] || [])].sort(
        (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
      )
    : [];

  const mergeMessages = (existing, incoming, deletedSet) => {
    // IMPORTANT: filter BOTH sides by deletedSet — otherwise brandNew re-adds server messages
    // that were deleted locally but the API hasn't persisted yet
    const filteredIncoming = incoming.filter((m) => !deletedSet.has(String(m._id)));
    const base = existing.filter((m) => !deletedSet.has(String(m._id)));

    const serverById = new Map(filteredIncoming.map((m) => [String(m._id), m]));
    const existingIds = new Set(base.map((m) => String(m._id)));

    // Update existing with server data; but preserve local tombstone (deletedForEveryone)
    // so the UI stays deleted even if the server hasn't committed the change yet
    const updated = base.map((m) => {
      const sv = serverById.get(String(m._id));
      if (!sv) return m;                  // not on server yet — keep local (optimistic)
      if (m.deletedForEveryone) return m; // local tombstone wins over stale server data
      return sv;                          // use fresh server data
    });

    // Add genuinely new messages from server (messages from the other user)
    const brandNew = filteredIncoming.filter((m) => !existingIds.has(String(m._id)));

    return [...updated, ...brandNew];
  };

  const fetchMessages = async (user) => {
    if (!currentUser?._id || !user?._id || user?.isMock) return;
    try {
      setLoadingMessages(true);
      let data;
      if (user.isGroup) {
        ({ data } = await api.get(`/messages/group/${user._id}?memberId=${currentUser._id}`));
      } else {
        ({ data } = await api.get(`/messages/${currentUser._id}/${user._id}`));
      }
      setAllChats((p) => ({
        ...p,
        [user._id]: mergeMessages(p[user._id] || [], data, localDeletedIdsRef.current),
      }));
    } catch {
      /* ignore */
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!currentUser?._id || !selectedUser?._id || selectedUser?.isMock) return;
    const poll = async () => {
      try {
        let data;
        if (selectedUser.isGroup) {
          ({ data } = await api.get(`/messages/group/${selectedUser._id}?memberId=${currentUser._id}`));
        } else {
          ({ data } = await api.get(`/messages/${currentUser._id}/${selectedUser._id}`));
        }
        setAllChats((p) => ({
          ...p,
          [selectedUser._id]: mergeMessages(
            p[selectedUser._id] || [],
            data,
            localDeletedIdsRef.current
          ),
        }));
      } catch {
        /* ignore */
      }
    };
    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, [selectedUser?._id, selectedUser?.isMock, selectedUser?.isGroup, currentUser?._id]);

  const handleSelectUser = async (user, options = {}) => {
    setSelectedUser(user);
    setMobileChatOpen(true);
    setUnreadCounts((p) => ({ ...p, [user._id]: 0 }));
    setAllChats((p) => ({ ...p, [user._id]: p[user._id] || [] }));
    if (options.scrollToId) setScrollToMessageId(options.scrollToId);
    else setScrollToMessageId(null);
    await fetchMessages(user);
  };

  const chatKeyFromSent = (msg) => {
    if (msg.groupId) return String(msg.groupId);
    const rid = typeof msg.receiver === "object" ? msg.receiver?._id : msg.receiver;
    return String(rid);
  };

  const handleMessageSent = (msg) => {
    const cid = msg.groupId ? String(msg.groupId) : chatKeyFromSent(msg);
    setAllChats((p) => {
      const ex = p[cid] || [];
      return ex.some((m) => m._id === msg._id) ? p : { ...p, [cid]: [...ex, msg] };
    });
  };

  const handleReceiveMessage = (msg) => {
    const cid = msg.groupId ? String(msg.groupId) : String(typeof msg.sender === "object" ? msg.sender._id : msg.sender);
    setAllChats((p) => {
      const ex = p[cid] || [];
      return ex.some((m) => m._id === msg._id) ? p : { ...p, [cid]: [...ex, msg] };
    });
    if (String(cid) !== String(selectedUser?._id)) {
      setUnreadCounts((p) => ({ ...p, [cid]: (p[cid] || 0) + 1 }));
    }
  };

  const handleUpdateMessageStatus = (msgId, status) => {
    setAllChats((p) => {
      const up = { ...p };
      for (const cid in up) up[cid] = up[cid].map((m) => (m._id === msgId ? { ...m, status } : m));
      return up;
    });
  };

  // mode: 'me' | 'everyone'
  const handleDeleteMessage = (msgId, mode) => {
    if (mode === "me") {
      // Track so polling doesn't bring it back
      localDeletedIdsRef.current.add(msgId);
      // Remove from local state
      setAllChats((p) => {
        const up = { ...p };
        for (const cid in up) up[cid] = up[cid].filter((m) => m._id !== msgId);
        return up;
      });
    } else {
      // "everyone" — stamp tombstone locally; backend persists it
      setAllChats((p) => {
        const up = { ...p };
        for (const cid in up)
          up[cid] = up[cid].map((m) =>
            String(m._id) === String(msgId) ? { ...m, deletedForEveryone: true, text: "", fileUrl: "", fileName: "" } : m
          );
        return up;
      });
    }
  };

  const handleClearUnread = (cid) => setUnreadCounts((p) => ({ ...p, [cid]: 0 }));

  const handleProfileSave = (profile) => {
    if (profile?.photoBase64 != null) setProfilePhoto(profile.photoBase64 || null);
    if (currentUser && (profile?.name != null || profile?.about != null || profile?.photoBase64 != null)) {
      const updated = {
        ...currentUser,
        ...(profile.name != null ? { username: profile.name } : {}),
        ...(profile.about != null ? { about: profile.about } : {}),
        ...(profile.photoBase64 != null ? { avatar: profile.photoBase64 } : {}),
      };
      setCurrentUser(updated);
      try {
        localStorage.setItem("chat_user", JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save full user to localStorage (Quota Exceeded)");
      }
    }
  };

  const onJumpToStarred = async (msg) => {
    const myId = String(currentUser._id);
    let openUser;

    if (msg.groupId) {
      const gid = typeof msg.groupId === "object" ? msg.groupId._id : msg.groupId;
      const g = typeof msg.groupId === "object" ? msg.groupId : null;
      openUser = {
        _id: String(gid),
        name: g?.name || "Group",
        isGroup: true,
        members: g?.members,
      };
    } else {
      const senderId = String(msg.sender?._id || msg.sender);
      const receiverId = String(msg.receiver?._id || msg.receiver);
      const peerId = senderId === myId ? receiverId : senderId;
      const peerObj = senderId === myId ? msg.receiver : msg.sender;
      openUser =
        typeof peerObj === "object" && peerObj?.username
          ? peerObj
          : { _id: peerId, username: "User", avatar: "" };
    }

    setActivePanel("chats");
    await handleSelectUser(openUser, { scrollToId: msg._id });
  };

  if (!localStorage.getItem("chat_user")) return <Navigate to="/" replace />;

  const renderPanel = () => {
    switch (activePanel) {
      case "calls":
        return <CallsPanel />;
      case "communities":
        return <CommunitiesPanel />;
      case "status":
        return <StatusPanel currentUser={currentUser} socket={socket} />;
      case "starred":
        return (
          <StarredPanel currentUser={currentUser} onOpenMessage={onJumpToStarred} refreshKey={starTick} />
        );
      case "archived":
        return (
          <ArchivedPanel
            currentUser={currentUser}
            onOpenChat={handleSelectUser}
            onBack={() => setActivePanel("chats")}
          />
        );
      case "settings":
        return (
          <SettingsPanel
            currentUser={currentUser}
            profilePhoto={profilePhoto}
            onBack={() => setActivePanel("chats")}
            onProfileSave={handleProfileSave}
          />
        );
      default:
        return (
          <>
            <div
              className={`h-full w-full md:flex md:w-auto ${mobileChatOpen ? "hidden" : "flex"}`}
              style={{ flexShrink: 0 }}
            >
              <Sidebar
                currentUser={currentUser}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                unreadCounts={unreadCounts}
                onClearUnread={handleClearUnread}
                profilePhoto={profilePhoto}
                onOpenArchived={() => setActivePanel("archived")}
                onOpenSettings={() => setActivePanel("settings")}
              />
            </div>
            <div
              className={`relative h-full w-full flex-1 md:flex ${mobileChatOpen ? "flex" : "hidden"}`}
              style={{ minWidth: 0 }}
            >
              {loadingMessages && selectedUser && (
                <div
                  className="absolute left-1/2 top-[68px] z-50 -translate-x-1/2 rounded-full px-3 py-1 text-xs shadow"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  Loading messages…
                </div>
              )}
              <ChatWindow
                currentUser={currentUser}
                selectedUser={selectedUser}
                messages={activeMessages}
                onMessageSent={handleMessageSent}
                onReceiveMessage={handleReceiveMessage}
                onUpdateMessageStatus={handleUpdateMessageStatus}
                onDeleteMessage={handleDeleteMessage}
                onBack={() => setMobileChatOpen(false)}
                scrollToMessageId={scrollToMessageId}
                onStarChange={() => setStarTick((t) => t + 1)}
              />
            </div>
          </>
        );
    }
  };

  return (
    <main
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-chat)", fontFamily: "'Nunito','Segoe UI',sans-serif" }}
    >
      <LeftNav
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        currentUser={currentUser}
        profilePhoto={profilePhoto || currentUser?.avatar}
        onSettingsClick={() => setActivePanel("settings")}
      />

      <div key={activePanel} className="animate-panel-fade flex flex-1 overflow-hidden" style={{ minWidth: 0 }}>
        {renderPanel()}
      </div>
    </main>
  );
};

export default Chat;
