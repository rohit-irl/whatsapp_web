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
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
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
const SearchIcon = ({ color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={color}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const DateSeparator = ({ label }) => (
  <div className="flex items-center justify-center py-3">
    <span className="date-chip">{label}</span>
  </div>
);
const getDateLabel = (rawDate) => {
  if (!rawDate) return "";
  const d = new Date(rawDate),
    now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
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
      <h2 style={{ color: "var(--text-primary)", fontSize: 26, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        WhatsApp Web
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 300, lineHeight: 1.6, margin: 0 }}>
        Send and receive messages without keeping your phone online.
        <br />
        Use WhatsApp on up to 4 linked devices.
      </p>
    </div>
  </div>
);

const blobDurationSec = (blob) =>
  new Promise((resolve) => {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.src = u;
    a.onloadedmetadata = () => {
      resolve(Number.isFinite(a.duration) ? a.duration : 0);
      URL.revokeObjectURL(u);
    };
    a.onerror = () => {
      resolve(0);
      URL.revokeObjectURL(u);
    };
  });

const ChatWindow = ({
  currentUser,
  selectedUser,
  messages = [],
  loadingMessages = false,
  onMessageSent,
  onReceiveMessage,
  onBack,
  onUpdateMessageStatus,
  scrollToMessageId,
  onDeleteMessage,
  isTypingFor,          // userId or groupId of whoever is typing — from Chat.jsx
  onCall,
}) => {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMockTyping, setIsMockTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [waveformBars, setWaveformBars] = useState(Array(40).fill(3));
  const [isSearching, setIsSearching] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const tickRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const socket = useSocket();
  const bottomRef = useRef(null);
  const msgRefs = useRef({});
  const inputRef = useRef(null);
  const typingEmittedRef = useRef(false);  // prevents spam-emitting "typing" on every keystroke
  const typingTimeoutRef = useRef(null);   // debounce stop_typing
  const isMock = selectedUser?.isMock;
  const isGroup = selectedUser?.isGroup === true;
  // Derive typing indicator visibility from the prop — true only when the other side is typing
  const showTyping = isMockTyping || (isTypingFor != null && (
    isGroup
      ? String(isTypingFor) === String(selectedUser?._id)
      : String(isTypingFor) === String(selectedUser?._id)
  ));

  // receiveMessage is now handled globally in Chat.jsx so ALL background chats
  // get messages instantly. We only keep onReceiveMessage here for mock/offline replies.

  // ── Auto-scroll on new message or typing indicator change ───
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  useEffect(() => {
    if (selectedUser) setTimeout(() => inputRef.current?.focus(), 50);
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!scrollToMessageId) return;
    const el = msgRefs.current[scrollToMessageId];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollToMessageId, messages]);

  useEffect(() => {
    if (!socket || !selectedUser?._id || !currentUser?._id || messages.length === 0) return;
    const otherId = isGroup ? null : String(selectedUser._id);
    const hasOtherMessages = messages.some((m) => {
      const sid = typeof m.sender === "object" ? m.sender?._id : m.sender;
      return String(sid) !== String(currentUser._id) && m.status !== "seen";
    });
    if (!hasOtherMessages) return;
    
    if (!isGroup) {
      api.put("/messages/mark-seen", {
        senderId: otherId,
        receiverId: String(currentUser._id)
      }).catch(console.error);
    }
  }, [messages.length, selectedUser?._id, currentUser?._id, socket, isGroup]);

  const handleEmojiSelect = useCallback(
    (emoji) => {
      const input = inputRef.current;
      if (!input) {
        setDraft((p) => p + emoji);
        return;
      }
      const start = input.selectionStart ?? draft.length;
      const end = input.selectionEnd ?? draft.length;
      const newDraft = draft.slice(0, start) + emoji + draft.slice(end);
      setDraft(newDraft);
      requestAnimationFrame(() => {
        input.setSelectionRange(start + emoji.length, start + emoji.length);
        input.focus();
      });
    },
    [draft]
  );

  const sendPayload = async (body) => {
    const { data } = await api.post("/messages", body);
    onMessageSent({ ...data, status: data.status || MSG_STATUS.SENT });
    socket?.emit("sendMessage", data);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !selectedUser?._id || !currentUser?._id) return;
    setDraft("");
    setShowEmoji(false);
    // Stop typing indicator when message is sent
    emitStopTyping();

    if (!isMock) {
      try {
        setIsSending(true);
        const base = { sender: currentUser._id, text, type: "text" };
        if (isGroup) await sendPayload({ ...base, groupId: selectedUser._id });
        else await sendPayload({ ...base, receiver: selectedUser._id });
        setIsSending(false);
        return;
      } catch {
        setIsSending(false);
      }
    }
    sendMockText(text);
  };

  const sendMockText = (text) => {
    const msg = buildMockMessage({ senderId: currentUser._id, receiverId: selectedUser._id, text });
    onMessageSent(msg);
    progressStatus(msg._id);
    triggerMockReply();
  };

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
      setIsMockTyping(true);
      setTimeout(() => {
        setIsMockTyping(false);
        onReceiveMessage({
          ...buildMockMessage({ senderId: selectedUser._id, receiverId: currentUser._id, text: getRandomReply() }),
          status: undefined,
        });
      }, delay);
    }, 400);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio API for live waveform
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const BAR_COUNT = 40;
      const dataArr = new Uint8Array(analyser.frequencyBinCount);
      const drawWave = () => {
        analyser.getByteFrequencyData(dataArr);
        const bars = [];
        const step = Math.floor(dataArr.length / BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
          const val = dataArr[i * step] / 255; // 0-1
          bars.push(Math.max(3, Math.round(val * 36)));
        }
        setWaveformBars(bars);
        animFrameRef.current = requestAnimationFrame(drawWave);
      };
      drawWave();

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      mr.start();
      setIsRecording(true);
      setRecordingSec(0);
      tickRef.current = setInterval(() => setRecordingSec((s) => s + 1), 1000);
    } catch {
      alert("Microphone access is required for voice notes.");
    }
  };

  const stopWaveform = () => {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    analyserRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setWaveformBars(Array(40).fill(3));
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(tickRef.current);
    stopWaveform();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingSec(0);
  };

  const finishRecording = () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.onstop = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(tickRef.current);
      stopWaveform();
      setIsRecording(false);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];
      const durationSec = await blobDurationSec(blob);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileUrl = reader.result;
        if (!selectedUser?._id || !currentUser?._id) return;
        if (!isMock) {
          try {
            const base = {
              sender: currentUser._id,
              text: "",
              type: "audio",
              fileUrl,
              fileName: "voice-note.ogg",
              durationSec: Math.round(durationSec * 10) / 10,
            };
            if (isGroup) await sendPayload({ ...base, groupId: selectedUser._id });
            else await sendPayload({ ...base, receiver: selectedUser._id });
          } catch (err) {
            console.error(err);
          }
        } else {
          onMessageSent({
            _id: `mock-voice-${Date.now()}`,
            sender: currentUser._id,
            receiver: selectedUser._id,
            type: "audio",
            fileType: "audio",
            fileUrl,
            fileName: "voice-note.ogg",
            durationSec,
            text: "",
            timestamp: new Date().toISOString(),
            status: MSG_STATUS.SENT,
            isMock: true,
          });
        }
      };
      reader.readAsDataURL(blob);
      setRecordingSec(0);
    };
    mr.stop();
  };

  // ── Typing indicator emit helpers ─────────────────────
  const emitTyping = useCallback(() => {
    if (!socket || !currentUser?._id || !selectedUser?._id || isMock) return;
    if (!typingEmittedRef.current) {
      typingEmittedRef.current = true;
      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: isGroup ? undefined : selectedUser._id,
        groupId: isGroup ? selectedUser._id : undefined,
        username: currentUser.username,
      });
    }
    // Reset stop_typing debounce
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitStopTyping(), 2000);
  }, [socket, currentUser, selectedUser, isMock, isGroup]);

  const emitStopTyping = useCallback(() => {
    if (!socket || !currentUser?._id || !selectedUser?._id || isMock) return;
    clearTimeout(typingTimeoutRef.current);
    if (typingEmittedRef.current) {
      typingEmittedRef.current = false;
      socket.emit("stop_typing", {
        senderId: currentUser._id,
        receiverId: isGroup ? undefined : selectedUser._id,
        groupId: isGroup ? selectedUser._id : undefined,
      });
    }
  }, [socket, currentUser, selectedUser, isMock, isGroup]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Emits typing/stop_typing socket events while user types
  const handleDraftChange = (e) => {
    setDraft(e.target.value);
    if (e.target.value.trim()) emitTyping();
    else emitStopTyping();
  };

  const renderMessages = () => {
    const items = [];
    let lastLabel = "";
    
    const filtered = chatSearchQuery 
      ? (messages || []).filter(m => m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
      : (messages || []);

    filtered.forEach((msg, idx) => {
      const raw = msg.timestamp || msg.createdAt;
      const label = getDateLabel(raw);
      if (label && label !== lastLabel) {
        lastLabel = label;
        items.push(<DateSeparator key={`d-${idx}`} label={label} />);
      }
      
      const isMatch = chatSearchQuery && msg.text?.toLowerCase().includes(chatSearchQuery.toLowerCase());
      
      const prev = messages[idx - 1];
      const currSender = getId(msg.sender);
      const prevSender = prev ? getId(prev.sender) : null;
      const mid = msg._id || `${currSender}-${raw}-${idx}`;
      items.push(
        <div key={mid} ref={(el) => { if (msg._id) msgRefs.current[msg._id] = el; }}>
          <MessageBubble
            message={msg}
            isOwnMessage={currSender === currentUser?._id}
            isFirstInGroup={currSender !== prevSender}
            showSenderName={isGroup}
            currentUserId={currentUser?._id}
            onDeleteMessage={onDeleteMessage}
          />
        </div>
      );
    });
    return items;
  };

  const hasDraft = draft.trim().length > 0;
  const fmtRec = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const actionButton = () => {
    if (isRecording) {
      return (
        <>
          <button
            type="button"
            onClick={finishRecording}
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "var(--accent)", color: "#fff", flexShrink: 0 }}
            aria-label="Send voice"
            title="Send voice note"
          >
            <SendIcon />
          </button>
        </>
      );
    }
    return (
      <button
        type="button"
        onClick={() => {
          if (hasDraft) handleSubmit();
          else startRecording();
        }}
        disabled={isSending}
        aria-label={hasDraft ? "Send" : "Voice"}
        className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200"
        style={{ background: "var(--accent)", flexShrink: 0, color: "#fff" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
      >
        <span key={hasDraft ? "send" : "mic"} className="animate-icon-in block">
          {hasDraft ? <SendIcon /> : <MicIcon />}
        </span>
      </button>
    );
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden" style={{ background: "var(--bg-chat)" }}>
      {!selectedUser ? (
        <EmptyState />
      ) : (
        <>
          <ChatHeader 
            selectedUser={selectedUser} 
            onBack={onBack} 
            onCall={onCall} 
            onSearch={() => setIsSearching(v => !v)} 
          />

          {isSearching && (
            <div className="px-4 py-2 flex items-center gap-2" style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-sidebar)" }}>
                <SearchIcon color="var(--text-secondary)" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search in chat..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: "var(--text-primary)" }}
                />
                {chatSearchQuery && (
                  <button onClick={() => setChatSearchQuery("")} style={{ color: "var(--text-secondary)" }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                )}
              </div>
              <button 
                onClick={() => { setIsSearching(false); setChatSearchQuery(""); }}
                className="text-sm font-medium"
                style={{ color: "var(--accent)" }}
              >
                Done
              </button>
            </div>
          )}

          <div
            className="scrollbar-wa chat-bg flex-1 overflow-y-auto px-4 py-3"
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}
          >
            {loadingMessages ? (
              <div className="flex flex-1 items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-[var(--accent)] border-t-transparent opacity-70" />
              </div>
            ) : (
              <>
                {(() => {
                  const renderedItems = renderMessages();
                  if (chatSearchQuery && renderedItems.length === 0) {
                    return (
                      <div className="mx-auto mt-4">
                        <span className="date-chip">No messages found matching "{chatSearchQuery}"</span>
                      </div>
                    );
                  }
                  if (messages.length === 0 && !isTypingFor && !chatSearchQuery) {
                    return (
                      <div className="mx-auto mt-4">
                        <span className="date-chip">Messages are end-to-end encrypted 🔒</span>
                      </div>
                    );
                  }
                  return renderedItems;
                })()}
                {showTyping && <TypingIndicator />}
                <div ref={bottomRef} style={{ height: 1 }} />
              </>
            )}
          </div>

          <div className="relative flex items-end gap-2 px-3 py-2" style={{ background: "var(--bg-input)", flexShrink: 0 }}>
            <EmojiPicker isOpen={showEmoji} onClose={() => setShowEmoji(false)} onEmojiSelect={handleEmojiSelect} />
            <AttachMenu isOpen={showAttach} onClose={() => setShowAttach(false)} onFileSelected={handleFileSelected} />

            <div className="flex items-center gap-1 pb-0.5">
              <button
                type="button"
                aria-label="Emoji"
                onClick={() => {
                  setShowEmoji((v) => !v);
                  setShowAttach(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                style={{ color: showEmoji ? "var(--accent)" : "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = showEmoji ? "var(--accent)" : "var(--text-secondary)")}
              >
                <EmojiIcon />
              </button>
              <button
                type="button"
                aria-label="Attach"
                onClick={() => {
                  setShowAttach((v) => !v);
                  setShowEmoji(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                style={{ color: showAttach ? "var(--accent)" : "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = showAttach ? "var(--accent)" : "var(--text-secondary)")}
              >
                <AttachIcon />
              </button>
            </div>

            {!isRecording ? (
              <form onSubmit={handleSubmit} className="flex flex-1 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={handleDraftChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                  disabled={isSending}
                  className="w-full rounded-full px-5 py-2.5 text-sm outline-none"
                  style={{
                    background: "var(--bg-sidebar)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                    caretColor: "var(--accent)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  }}
                  onFocus={() => {
                    setShowEmoji(false);
                    setShowAttach(false);
                  }}
                />
              </form>
            ) : (
              /* ── RECORDING BAR ── */
              <div
                className="flex flex-1 items-center gap-2 px-3"
                style={{
                  background: "var(--bg-sidebar)",
                  borderRadius: 24,
                  border: "1px solid var(--border-subtle)",
                  minHeight: 44,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* delete / discard */}
                <button
                  type="button"
                  onClick={cancelRecording}
                  title="Delete recording"
                  aria-label="Delete recording"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(241,92,109,0.15)",
                    color: "#f15c6d",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(241,92,109,0.30)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(241,92,109,0.15)")}
                >
                  <TrashIcon />
                </button>

                {/* pulsing red dot */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#f15c6d",
                    flexShrink: 0,
                    animation: "recPulse 1s ease-in-out infinite",
                  }}
                />

                {/* timer */}
                <span
                  className="text-xs tabular-nums"
                  style={{ color: "#f15c6d", fontWeight: 600, minWidth: 36, flexShrink: 0 }}
                >
                  {fmtRec(recordingSec)}
                </span>

                {/* live waveform */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    height: 36,
                    overflow: "hidden",
                  }}
                >
                  {waveformBars.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: 3,
                        height: h,
                        borderRadius: 4,
                        background:
                          h > 24
                            ? "#f15c6d"
                            : h > 12
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                        transition: "height 0.08s ease, background 0.15s",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1">{actionButton()}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
