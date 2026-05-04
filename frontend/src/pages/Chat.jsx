import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import ChatWindow from "../components/ChatWindow";
import LeftNav from "../components/LeftNav";
import Sidebar from "../components/Sidebar";
import ArchivedPanel from "../components/panels/ArchivedPanel";
import CallsPanel from "../components/panels/CallsPanel";
import CommunitiesPanel from "../components/panels/CommunitiesPanel";


import StatusPanel from "../components/panels/StatusPanel";
import ContactsPanel from "../components/panels/ContactsPanel";
import SettingsPanel from "../components/settings/SettingsPanel";
import CallModal from "../components/CallModal";
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


  // isTypingFor: userId/groupId of whoever is currently typing → shown in ChatWindow
  const [isTypingFor, setIsTypingFor] = useState(null);
  const [call, setCall] = useState({ status: null, username: "", avatar: "", type: "", partnerId: null, isCaller: false });
  // Track IDs deleted "for me" locally so polling doesn't revert them
  const localDeletedIdsRef = useRef(new Set());
  // Track socket connection state so we can skip the fallback poll when live
  const socketConnectedRef = useRef(false);
  const typingTimerRef = useRef({});
  const selectedUserRef = useRef(selectedUser);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

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

    // ── Track connection state ────────────────────────────
    const onConnect = () => { socketConnectedRef.current = true; };
    const onDisconnect = () => { socketConnectedRef.current = false; };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socketConnectedRef.current = socket.connected;

    // ── Profile updates ───────────────────────────────────
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
      } catch { /* ignore */ }
    };
    socket.on("profile_updated", onProfile);

    // ── Status / lastSeen ─────────────────────────────────
    const onStatusChange = ({ userId, isOnline, lastSeen }) => {
      setSelectedUser((u) =>
        u && String(u._id) === String(userId) ? { ...u, isOnline, lastSeen } : u
      );
    };
    socket.on("user_status_change", onStatusChange);

    // ── Incoming messages (ALL chats, not just active) ────
    const onReceive = (msg) => {
      const senderId = String(typeof msg.sender === "object" ? msg.sender._id : msg.sender);
      const receiverId = String(typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver);
      const cid = msg.groupId
        ? String(msg.groupId)
        : senderId === String(currentUser?._id)
          ? receiverId
          : senderId;

      setAllChats((p) => {
        const ex = p[cid] || [];
        if (ex.some((m) => String(m._id) === String(msg._id))) return p;
        return { ...p, [cid]: [...ex, msg] };
      });

      setUnreadCounts((u) => {
        if (selectedUserRef.current && String(selectedUserRef.current._id) === String(cid)) {
          return u;
        }
        return { ...u, [cid]: (u[cid] || 0) + 1 };
      });

      const senderIdStr = String(typeof msg.sender === "object" ? msg.sender._id : msg.sender);
      if (senderIdStr && senderIdStr !== String(currentUser._id)) {
        socket.emit("message_delivered", {
          messageId: msg._id,
          senderId: senderIdStr,
          chatId: msg.groupId ? msg.groupId : currentUser._id,
        });
      }
    };
    socket.on("receiveMessage", onReceive);

    // ── Typing indicators ────────────────────────────────
    const onTyping = ({ senderId, groupId }) => {
      const key = groupId ? String(groupId) : String(senderId);
      setIsTypingFor(key);
      clearTimeout(typingTimerRef.current[key]);
      typingTimerRef.current[key] = setTimeout(() => {
        setIsTypingFor((cur) => (cur === key ? null : cur));
      }, 3000);
    };
    const onStopTyping = ({ senderId, groupId }) => {
      const key = groupId ? String(groupId) : String(senderId);
      clearTimeout(typingTimerRef.current[key]);
      setIsTypingFor((cur) => (cur === key ? null : cur));
    };
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);

    // ── Read receipts ─────────────────────────────────────
    const onMessagesSeen = ({ readerId }) => {
      setAllChats((p) => {
        const cid = String(readerId);
        if (!p[cid]) return p;
        return {
          ...p,
          [cid]: p[cid].map((m) =>
            m.status !== "seen" ? { ...m, status: "seen" } : m
          ),
        };
      });
    };
    socket.on("messages_seen", onMessagesSeen);

    // ── Message Status Update ─────────────────────────────
    const onMessageStatusUpdate = ({ messageId, chatId, status }) => {
      setAllChats((p) => {
        const up = { ...p };
        for (const cid in up) {
          up[cid] = up[cid].map((m) => {
            if (String(m._id) === String(messageId) && m.status !== "seen") {
              return { ...m, status };
            }
            return m;
          });
        }
        return up;
      });
    };
    socket.on("message_status_update", onMessageStatusUpdate);

    // ── Delete for everyone ───────────────────────────────
    const onMsgUpdated = ({ messageId, deletedForEveryone }) => {
      if (!deletedForEveryone) return;
      setAllChats((p) => {
        const up = { ...p };
        for (const cid in up)
          up[cid] = up[cid].map((m) =>
            String(m._id) === String(messageId)
              ? { ...m, deletedForEveryone: true, text: "", fileUrl: "", fileName: "" }
              : m
          );
        return up;
      });
    };
    socket.on("messageUpdated", onMsgUpdated);

    // ── Call signaling ─────────────────────────────────────
    const onIncomingCall = ({ callerId, callerName, callerAvatar, type, callId }) => {
      setCall({ status: "incoming", username: callerName, avatar: callerAvatar, type, partnerId: callerId, isCaller: false, callId });
    };
    const onCallInitiated = ({ callId }) => {
      setCall((p) => ({ ...p, callId }));
    };
    const onCallAccepted = ({ callId }) => setCall((p) => ({ ...p, status: "active", callId: callId || p.callId }));
    const onCallRejected = () => setCall({ status: null, username: "", avatar: "", type: "", partnerId: null, isCaller: false, callId: null });
    const onCallEnded = () => setCall({ status: null, username: "", avatar: "", type: "", partnerId: null, isCaller: false, callId: null });

    socket.on("incoming_call", onIncomingCall);
    socket.on("call_initiated", onCallInitiated);
    socket.on("call_accepted", onCallAccepted);
    socket.on("call_rejected", onCallRejected);
    socket.on("call_ended", onCallEnded);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("profile_updated", onProfile);
      socket.off("user_status_change", onStatusChange);
      socket.off("receiveMessage", onReceive);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("messages_seen", onMessagesSeen);
      socket.off("message_status_update", onMessageStatusUpdate);
      socket.off("messageUpdated", onMsgUpdated);
      socket.off("incoming_call", onIncomingCall);
      socket.off("call_initiated", onCallInitiated);
      socket.off("call_accepted", onCallAccepted);
      socket.off("call_rejected", onCallRejected);
      socket.off("call_ended", onCallEnded);
    };
  }, [socket]);

  const activeMessages = selectedUser
    ? [...(allChats[selectedUser._id] || [])].sort(
      (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
    )
    : [];

  const mergeMessages = (existing = [], incoming = [], deletedSet) => {
    if (!Array.isArray(existing)) existing = [];
    if (!Array.isArray(incoming)) incoming = [];

    const filteredIncoming = incoming.filter((m) => !deletedSet.has(String(m._id)));
    const base = existing.filter((m) => !deletedSet.has(String(m._id)));

    const serverById = new Map(filteredIncoming.map((m) => [String(m._id), m]));
    const existingIds = new Set(base.map((m) => String(m._id)));

    const updated = base.map((m) => {
      const sv = serverById.get(String(m._id));
      if (!sv) return m;
      if (m.deletedForEveryone) return m;
      return sv;
    });

    const brandNew = filteredIncoming.filter((m) => !existingIds.has(String(m._id)));

    const combined = [...updated, ...brandNew];
    return combined.sort((a, b) => {
      const ta = new Date(a.timestamp || a.createdAt).getTime();
      const tb = new Date(b.timestamp || b.createdAt).getTime();
      return ta - tb;
    });
  };

  const fetchMessages = async (user) => {
    if (!currentUser?._id || !user?._id) return;
    if (user.isMock || ["c1", "c2", "c3"].includes(user._id)) {
      setLoadingMessages(false);
      const existing = allChats[user._id] || [];
      if (existing.length === 0) {
        const initial = [
          {
            _id: `m-${user._id}-1`,
            sender: user._id,
            text: `Welcome to the ${user.username} announcements!`,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: "seen"
          },
          {
            _id: `m-${user._id}-2`,
            sender: user._id,
            text: "This is where you'll see important updates and news.",
            timestamp: new Date().toISOString(),
            status: "seen"
          }
        ];
        setAllChats(p => ({ ...p, [user._id]: initial }));
      }
      return;
    }

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
      if (socketConnectedRef.current) return;
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
      } catch { /* ignore */ }
    };
    poll();
    const id = setInterval(poll, 30000);
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

  const handleReceiveMessage = useCallback((msg) => {
    const cid = msg.groupId ? String(msg.groupId) : String(typeof msg.sender === "object" ? msg.sender._id : msg.sender);
    setAllChats((p) => {
      const ex = p[cid] || [];
      return ex.some((m) => String(m._id) === String(msg._id)) ? p : { ...p, [cid]: [...ex, msg] };
    });
  }, []);

  const handleUpdateMessageStatus = (msgId, status) => {
    setAllChats((p) => {
      const up = { ...p };
      for (const cid in up) up[cid] = up[cid].map((m) => (m._id === msgId ? { ...m, status } : m));
      return up;
    });
  };

  const handleDeleteMessage = (msgId, mode) => {
    if (mode === "me") {
      localDeletedIdsRef.current.add(msgId);
      setAllChats((p) => {
        const up = { ...p };
        for (const cid in up) up[cid] = up[cid].filter((m) => m._id !== msgId);
        return up;
      });
    } else {
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

  const handleStartCall = (type, targetUser = selectedUser) => {
    if (!targetUser || !currentUser || !socket) {
      console.error(">>> [FRONTEND] Cannot start call: missing data", { targetUser, currentUser, socket: !!socket });
      return;
    }
    const payload = {
      callerId: currentUser._id,
      callerName: currentUser.username,
      callerAvatar: currentUser.avatar,
      receiverId: targetUser._id,
      type
    };
    console.log(">>> [FRONTEND] Emitting call_user", payload);
    setCall({ status: "calling", username: targetUser.username, avatar: targetUser.avatar, type, partnerId: targetUser._id, isCaller: true, callId: null });
    socket.emit("call_user", payload);
  };

  const handleAcceptCall = () => {
    if (!call.partnerId || !currentUser || !socket) return;
    socket.emit("accept_call", { callerId: call.partnerId, receiverId: currentUser._id, callId: call.callId });
    setCall((prev) => ({ ...prev, status: "active" }));
  };

  const handleRejectCall = () => {
    if (!call.partnerId || !currentUser || !socket) return;
    socket.emit("reject_call", { callerId: call.partnerId, receiverId: currentUser._id, callId: call.callId });
    setCall({ status: null, username: "", avatar: "", type: "", partnerId: null, isCaller: false, callId: null });
  };

  const handleEndCall = () => {
    if (!call.partnerId || !currentUser || !socket) return;
    socket.emit("end_call", { receiverId: call.partnerId, callerId: currentUser._id, callId: call.callId });
    setCall({ status: null, username: "", avatar: "", type: "", partnerId: null, isCaller: false, callId: null });
  };


  if (!localStorage.getItem("chat_user")) return <Navigate to="/" replace />;

  const renderLeftPanel = () => {
    switch (activePanel) {
      case "calls":
        return (
          <CallsPanel 
            currentUser={currentUser} 
            activePanel={activePanel} 
            onStartNewCall={() => setActivePanel("contacts")} 
          />
        );
      case "contacts":
        return (
          <ContactsPanel 
            currentUser={currentUser} 
            onCall={(type, user) => {
              handleStartCall(type, user);
              // Optional: switch back to calls after starting? Or stay?
            }} 
            onBack={() => setActivePanel("calls")}
          />
        );
      case "communities":
        return (
          <CommunitiesPanel
            onSelectAnnouncement={(community) => {
              handleSelectUser(community);
            }}
          />
        );
      case "status":
        return <StatusPanel currentUser={currentUser} socket={socket} />;
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
          <Sidebar
            currentUser={currentUser}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            unreadCounts={unreadCounts}
            onClearUnread={handleClearUnread}
            profilePhoto={profilePhoto}
            onOpenArchived={() => setActivePanel("archived")}
            onOpenSettings={() => setActivePanel("settings")}
            allChats={allChats}
          />
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
        onPanelChange={(panel) => {
          setActivePanel(panel);
          if (panel !== "chats" && panel !== "archived") {
            setSelectedUser(null);
          }
        }}
        currentUser={currentUser}
        profilePhoto={profilePhoto || currentUser?.avatar}
        onSettingsClick={() => {
          setActivePanel("settings");
          setSelectedUser(null);
        }}
      />

      <div className="flex flex-1 overflow-hidden" style={{ minWidth: 0 }}>
        {/* Left Side: Sidebar / Communities / etc. */}
        <div
          className={`h-full w-full md:flex md:w-auto ${mobileChatOpen ? "hidden" : "flex"}`}
          style={{ flexShrink: 0 }}
        >
          {renderLeftPanel()}
        </div>

        {/* Right Side: Chat Window */}
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
            loadingMessages={loadingMessages}
            onMessageSent={handleMessageSent}
            onReceiveMessage={handleReceiveMessage}
            onUpdateMessageStatus={handleUpdateMessageStatus}
            onDeleteMessage={handleDeleteMessage}
            onBack={() => setMobileChatOpen(false)}
            onStarChange={() => {}}
            scrollToMessageId={scrollToMessageId}
            isTypingFor={isTypingFor}
            onCall={handleStartCall}
            activePanel={activePanel}
          />
          {call.status && (
            <CallModal
              callData={call}
              onAccept={handleAcceptCall}
              onReject={handleRejectCall}
              onEnd={handleEndCall}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Chat;
