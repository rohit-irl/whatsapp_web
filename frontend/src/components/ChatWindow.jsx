import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import useSocket from "../hooks/useSocket";
import AttachMenu from "./AttachMenu";
import ChatHeader from "./ChatHeader";
import EmojiPicker from "./EmojiPicker";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import {
  buildFileMockMessage,
  buildMockMessage,
  getRandomReply,
  MSG_STATUS,
} from "../utils/mockData";

const getId = (v) => (typeof v === "object" ? v?._id : v);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);
const AttachIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
  </svg>
);

const DateSeparator = ({ label }) => (
  <div className="flex items-center justify-center py-3">
    <span className="date-chip">{label}</span>
  </div>
);
const getDateLabel = (rawDate) => {
  if (!rawDate) return "";
  const d = new Date(rawDate), now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today) return "TODAY";
  if (d >= yesterday) return "YESTERDAY";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

const EmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center gap-6" style={{ background: "var(--bg-chat)" }}>
    <svg width="240" height="188" viewBox="0 0 880 595" fill="none" opacity="0.25">
      <rect x="160" y="80" width="560" height="380" rx="24" fill="#00a884" />
      <rect x="200" y="120" width="480" height="300" rx="12" fill="#efeae2" />
      <rect x="300" y="460" width="280" height="24" rx="4" fill="#00a884" />
      <rect x="240" y="484" width="400" height="16" rx="8" fill="#00a884" />
      <circle cx="440" cy="270" r="60" fill="#00a884" opacity="0.5" />
      <path d="M416 270l16 16 32-32" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="text-center">
      <h2 style={{ color: "var(--text-primary)", fontSize: 26, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>WhatsApp Web</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 300, lineHeight: 1.6, margin: 0 }}>
        Send and receive messages without keeping your phone online.<br />Use WhatsApp on up to 4 linked devices.
      </p>
    </div>
    <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "rgba(0,168,132,0.06)" }}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ color: "var(--accent)" }}>
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
      Your personal messages are end-to-end encrypted
    </div>
  </div>
);

const ChatWindow = ({ currentUser, selectedUser, messages, onMessageSent, onReceiveMessage, onBack, onUpdateMessageStatus }) => {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const socket = useSocket();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isMock = selectedUser?.isMock;

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      if (!currentUser?._id || !selectedUser?._id) return;
      if (getId(msg.sender) === selectedUser._id && getId(msg.receiver) === currentUser._id)
        onReceiveMessage(msg);
    };
    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [socket, currentUser?._id, selectedUser?._id, onReceiveMessage]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (selectedUser) setTimeout(() => inputRef.current?.focus(), 50); }, [selectedUser?._id]);

  // ── Emoji insert at cursor ────────────────────────────
  const handleEmojiSelect = useCallback((emoji) => {
    const input = inputRef.current;
    if (!input) { setDraft(p => p + emoji); return; }
    const start = input.selectionStart ?? draft.length;
    const end   = input.selectionEnd   ?? draft.length;
    const newDraft = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(newDraft);
    requestAnimationFrame(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length);
      input.focus();
    });
  }, [draft]);

  // ── Send text ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !selectedUser?._id || !currentUser?._id) return;
    setDraft("");
    setShowEmoji(false);

    if (!isMock) {
      try {
        setIsSending(true);
        const { data } = await api.post("/messages", { sender: currentUser._id, receiver: selectedUser._id, text });
        onMessageSent({ ...data, status: data.status || MSG_STATUS.SENT });
        socket?.emit("sendMessage", data);
        setIsSending(false);
        return;
      } catch { setIsSending(false); }
    }
    sendMockText(text);
  };

  const sendMockText = (text) => {
    const msg = buildMockMessage({ senderId: currentUser._id, receiverId: selectedUser._id, text });
    onMessageSent(msg);
    progressStatus(msg._id);
    triggerMockReply();
  };

  // ── Send file ─────────────────────────────────────────
  const handleFileSelected = ({ fileType, file, fileUrl }) => {
    const msg = buildFileMockMessage({ senderId: currentUser._id, receiverId: selectedUser._id, file, fileType, fileUrl });
    onMessageSent(msg);
    progressStatus(msg._id);
    triggerMockReply();
  };

  const progressStatus = (msgId) => {
    setTimeout(() => {
      onUpdateMessageStatus?.(msgId, MSG_STATUS.DELIVERED);
      setTimeout(() => onUpdateMessageStatus?.(msgId, MSG_STATUS.SEEN), 2000);
    }, 1000);
  };

  const triggerMockReply = () => {
    const delay = 1200 + Math.random() * 1200;
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onReceiveMessage({ ...buildMockMessage({ senderId: selectedUser._id, receiverId: currentUser._id, text: getRandomReply() }), status: undefined });
      }, delay);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const renderMessages = () => {
    const items = []; let lastLabel = "";
    messages.forEach((msg, idx) => {
      const raw = msg.timestamp || msg.createdAt;
      const label = getDateLabel(raw);
      if (label && label !== lastLabel) { lastLabel = label; items.push(<DateSeparator key={`d-${idx}`} label={label} />); }
      const prev = messages[idx - 1];
      const currSender = getId(msg.sender);
      items.push(
        <MessageBubble key={msg._id || `${currSender}-${raw}-${idx}`}
          message={msg}
          isOwnMessage={currSender === currentUser?._id}
          isFirstInGroup={currSender !== (prev ? getId(prev.sender) : null)}
        />
      );
    });
    return items;
  };

  const hasDraft = draft.trim().length > 0;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden" style={{ background: "var(--bg-chat)" }}>
      {!selectedUser ? <EmptyState /> : (
        <>
          <ChatHeader selectedUser={selectedUser} onBack={onBack} />

          <div className="scrollbar-wa chat-bg flex-1 overflow-y-auto px-4 py-3"
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {messages.length === 0 && !isTyping && (
              <div className="mx-auto mt-4"><span className="date-chip">Messages are end-to-end encrypted 🔒</span></div>
            )}
            {renderMessages()}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} style={{ height: 1 }} />
          </div>

          {/* Input bar — position:relative for absolute pickers */}
          <div className="relative flex items-end gap-2 px-3 py-2" style={{ background: "var(--bg-input)", flexShrink: 0 }}>

            {/* Emoji picker */}
            <EmojiPicker isOpen={showEmoji} onClose={() => setShowEmoji(false)} onEmojiSelect={handleEmojiSelect} />

            {/* Attach menu */}
            <AttachMenu isOpen={showAttach} onClose={() => setShowAttach(false)} onFileSelected={handleFileSelected} />

            <div className="flex items-center gap-1 pb-0.5">
              <button type="button" aria-label="Emoji"
                onClick={() => { setShowEmoji(v => !v); setShowAttach(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                style={{ color: showEmoji ? "var(--accent)" : "var(--text-secondary)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = showEmoji ? "var(--accent)" : "var(--text-secondary)"}>
                <EmojiIcon />
              </button>
              <button type="button" aria-label="Attach"
                onClick={() => { setShowAttach(v => !v); setShowEmoji(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                style={{ color: showAttach ? "var(--accent)" : "var(--text-secondary)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = showAttach ? "var(--accent)" : "var(--text-secondary)"}>
                <AttachIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 items-center">
              <input ref={inputRef} type="text" value={draft}
                onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type a message" disabled={isSending}
                className="w-full rounded-full px-5 py-2.5 text-sm outline-none"
                style={{ background: "var(--bg-sidebar)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", caretColor: "var(--accent)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
                onFocus={() => { setShowEmoji(false); setShowAttach(false); }} />
            </form>

            <button type="button" onClick={handleSubmit} disabled={isSending}
              aria-label={hasDraft ? "Send" : "Voice"}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200"
              style={{ background: "var(--accent)", flexShrink: 0, color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--accent-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--accent)"}>
              <span key={hasDraft ? "send" : "mic"} className="animate-icon-in block">
                {hasDraft ? <SendIcon /> : <MicIcon />}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
