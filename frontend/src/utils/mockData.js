// ─────────────────────────────────────────────────────────
//  Mock contacts — used when backend is unreachable
//  isOnline: false by default — only true if socket confirms
// ─────────────────────────────────────────────────────────
export const MOCK_CONTACTS = [
  { _id: "mock-gokul", username: "Gokul", isMock: true, isOnline: false },
  { _id: "mock-prince", username: "Prince", isMock: true, isOnline: false },
  { _id: "mock-ananya", username: "Ananya", isMock: true, isOnline: false },
  { _id: "mock-dev", username: "Dev Team", isMock: true, isOnline: false },
];

// ─────────────────────────────────────────────────────────
//  Mock auto-replies per contact
// ─────────────────────────────────────────────────────────
export const MOCK_REPLIES = [
  "Hey! How's it going? 😄",
  "Sure, sounds good to me!",
  "Let me check and get back to you.",
  "Haha yeah, totally agree 😂",
  "On my way! Be there in 10.",
  "Can we catch up later today?",
  "That's actually really cool 🔥",
  "Did you see the match last night?",
  "Yeah bro, I'll handle it 👍",
  "Send me the file when you get a chance.",
  "Okay got it, thanks!",
  "lol no way 😂😂",
  "Miss hanging out, let's plan something soon!",
  "Working on it right now, just a sec.",
  "👌",
];

export const getRandomReply = () =>
  MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];

// ─────────────────────────────────────────────────────────
//  WhatsApp-style timestamp formatter
// ─────────────────────────────────────────────────────────
export const formatTimestamp = (rawDate) => {
  if (!rawDate) return "";
  const date = new Date(rawDate);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

// ─────────────────────────────────────────────────────────
//  Deterministic avatar gradient from username
//  (light-mode friendly — more vibrant, still readable on white)
// ─────────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ["#00a884", "#007d5e"],  // WhatsApp green
  ["#1d7abf", "#155d8f"],  // blue
  ["#8b5cf6", "#6d3fd6"],  // purple
  ["#f97316", "#c45a0a"],  // orange
  ["#0891b2", "#05677e"],  // teal
  ["#be185d", "#8a1144"],  // pink
  ["#059669", "#026b4a"],  // emerald
  ["#7c3aed", "#5b28b3"],  // violet
];

export const getAvatarGradient = (username = "") => {
  const index =
    (username.charCodeAt(0) + (username.charCodeAt(1) || 0)) %
    AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

// ─────────────────────────────────────────────────────────
//  Message status constants
// ─────────────────────────────────────────────────────────
export const MSG_STATUS = {
  SENDING: "sending",   // optimistic, not yet ACK'd
  SENT: "sent",         // server received → single gray tick
  DELIVERED: "delivered", // recipient device received → double gray tick
  SEEN: "seen",         // recipient read → double blue tick
};

// ─────────────────────────────────────────────────────────
//  Build a mock text message object (for offline demo)
// ─────────────────────────────────────────────────────────
export const buildMockMessage = ({ senderId, receiverId, text }) => ({
  _id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  sender: senderId,
  receiver: receiverId,
  text,
  timestamp: new Date().toISOString(),
  status: MSG_STATUS.SENT,
  isMock: true,
});

// ─────────────────────────────────────────────────────────
//  Build a mock file message (for attach feature)
//  fileType: 'image' | 'document' | 'video'
//  For images, fileUrl should be URL.createObjectURL(file)
// ─────────────────────────────────────────────────────────
export const buildFileMockMessage = ({ senderId, receiverId, file, fileType, fileUrl }) => ({
  _id: `mock-file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  sender: senderId,
  receiver: receiverId,
  text: null,
  fileType,
  fileName: file.name,
  fileSize: file.size,
  fileUrl: fileUrl || null,
  timestamp: new Date().toISOString(),
  status: MSG_STATUS.SENT,
  isMock: true,
});


// ─────────────────────────────────────────────────────────
//  localStorage key constants
// ─────────────────────────────────────────────────────────
export const LS_CHATS_KEY = "wa_chats";
export const LS_ACTIVE_KEY = "wa_active_chat";
export const LS_PROFILE_KEY = "wa_profile";          // { name, photoBase64 }

// ─────────────────────────────────────────────────────────
//  Per-contact lastSeen — stored as ISO string
//  Key: "wa_lastseen_<contactId>"
// ─────────────────────────────────────────────────────────
export const getLastSeenKey = (contactId) => `wa_lastseen_${contactId}`;

export const saveLastSeen = (contactId) => {
  try { localStorage.setItem(getLastSeenKey(contactId), new Date().toISOString()); } catch {}
};

export const getLastSeen = (contactId) => {
  try { return localStorage.getItem(getLastSeenKey(contactId)) || null; } catch { return null; }
};

// ─────────────────────────────────────────────────────────
//  Format lastSeen for display in chat header / contact list
//  Returns: "online" if isOnline, else "last seen today at 3:45 PM",
//           "last seen yesterday at 11:22 AM", "last seen 28/04/25"
// ─────────────────────────────────────────────────────────
/** serverLastSeen: ISO string or Date from API (per-user). Falls back to localStorage only if missing. */
export const formatLastSeen = (contactId, isOnline, serverLastSeen) => {
  if (isOnline) return "online";
  const raw =
    serverLastSeen != null
      ? typeof serverLastSeen === "string"
        ? serverLastSeen
        : new Date(serverLastSeen).toISOString()
      : getLastSeen(contactId);
  if (!raw) return "last seen recently";
  const date = new Date(raw);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  if (date >= today) return `last seen today at ${time}`;
  if (date >= yesterday) return `last seen yesterday at ${time}`;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `last seen ${dd}/${mm}/${yy}`;
};

export const formatStatusTime = (rawDate) => {
  if (!rawDate) return "";
  const d = new Date(rawDate);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  return `${Math.floor(sec / 86400)} days ago`;
};

// ─────────────────────────────────────────────────────────
//  Profile helpers
// ─────────────────────────────────────────────────────────
export const loadProfile = () => {
  try { const r = localStorage.getItem(LS_PROFILE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
};

export const saveProfile = (profile) => {
  try { localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile)); } catch (e) { console.warn("Quota Exceeded for profile"); }
};

// ─────────────────────────────────────────────────────────
//  Load persisted chats from localStorage (synchronous)
//  Returns { [contactId]: Message[] }
// ─────────────────────────────────────────────────────────
export const loadPersistedChats = () => {
  try {
    const raw = localStorage.getItem(LS_CHATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// ─────────────────────────────────────────────────────────
//  Load persisted active contact (synchronous)
// ─────────────────────────────────────────────────────────
export const loadPersistedActiveChat = () => {
  try {
    const raw = localStorage.getItem(LS_ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
