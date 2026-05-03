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

const EmptyState = ({ activePanel }) => {
  let config = {
    title: "WhatsApp Web",
    subtitle: "Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone at the same time.",
    icon: (
      <svg viewBox="0 0 420 320" width="320" height="240" fill="currentColor">
        <path d="M210 20c-100 0-180 80-180 180s80 180 180 180 180-80 180-180S310 20 210 20zm0 320c-77.3 0-140-62.7-140-140S132.7 60 210 60s140 62.7 140 140-62.7 140-140 140z" />
        <path d="M210 100c-55.2 0-100 44.8-100 100s44.8 100 100 100 100-44.8 100-100-44.8-100-100-100zm0 160c-33.1 0-60-26.9-60-60s26.9-60 60-60 60 26.9 60 60-26.9 60-60 60z" />
      </svg>
    ),
    accent: "#25d366"
  };
  
  if (activePanel === "status") {
    config = {
      title: "Status Updates",
      subtitle: "Share photos, videos and text that disappear after 24 hours.",
      content: (
        <div className="mt-6 flex flex-col items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366] text-white">✓</span>
            <span>Your status is end-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">👁</span>
            <span>See who viewed your updates</span>
          </div>
        </div>
      ),
      icon: (
        <svg viewBox="0 0 24 24" width="160" height="160" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.5-9H13V7h-2v5c0 .55.45 1 1 1h3.5v-2z" />
        </svg>
      ),
      accent: "#00a884"
    };
  } else if (activePanel === "calls") {
    config = {
      title: "Calls",
      subtitle: "Recent and missed calls will show up here.",
      content: (
        <div className="mt-8 grid grid-cols-2 gap-6 text-left">
          <div className="rounded-xl border border-dashed border-gray-300 p-4">
            <h4 className="mb-2 font-bold text-gray-700">Voice Calls</h4>
            <p className="text-xs text-gray-500">High-quality voice calling for personal or group conversations.</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-300 p-4">
            <h4 className="mb-2 font-bold text-gray-700">Video Calls</h4>
            <p className="text-xs text-gray-500">Face-to-face video calls with up to 32 people in a group.</p>
          </div>
        </div>
      ),
      icon: (
        <svg viewBox="0 0 24 24" width="160" height="160" fill="currentColor">
          <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 00-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z" />
        </svg>
      ),
      accent: "#008069"
    };
  } else if (activePanel === "communities") {
    config = {
      title: "Communities",
      subtitle: "Build a community and stay organized.",
      content: (
        <div className="mt-8 flex flex-col gap-6">
          <img 
            src="/community_illustration.png" 
            alt="Communities" 
            style={{ width: 300, height: "auto", borderRadius: 16, opacity: 0.9 }} 
          />
          <p className="max-w-sm text-sm text-gray-500">
            Communities help you bring related groups together and manage all your announcements in one place.
          </p>
        </div>
      ),
      icon: null,
      accent: "#54656f"
    };
  } else if (activePanel === "settings") {
    config = {
      title: "Settings",
      subtitle: "Customize your account and privacy.",
      content: (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="h-2 w-48 rounded-full bg-gray-100"><div className="h-full w-1/3 rounded-full bg-blue-500"></div></div>
          <p className="text-xs text-gray-400">Settings synchronized across all linked devices</p>
        </div>
      ),
      icon: (
        <svg viewBox="0 0 24 24" width="160" height="160" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      ),
      accent: "#8696a0"
    };
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
      style={{ 
        background: "var(--bg-empty)", 
        borderBottom: `6px solid ${config.accent}`,
        transition: "all 0.5s ease-in-out"
      }}
    >
      <div className="mb-6 opacity-10 animate-fade-in-up" style={{ color: config.accent }}>
        {config.icon}
      </div>
      <h1 className="mb-3 text-3xl font-light tracking-tight text-gray-700 animate-fade-in-up" style={{ color: "var(--text-primary)" }}>
        {config.title}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-gray-500 animate-fade-in-up" style={{ color: "var(--text-secondary)" }}>
        {config.subtitle}
      </p>
      {config.content && (
        <div className="animate-fade-in-up">
          {config.content}
        </div>
      )}
      <div className="mt-12 flex items-center gap-2 text-xs text-gray-400 opacity-60">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        End-to-end encrypted
      </div>
    </div>
  );
};

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
  isTypingFor,
  onCall,
  activePanel,
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
        <EmptyState activePanel={activePanel} />
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
