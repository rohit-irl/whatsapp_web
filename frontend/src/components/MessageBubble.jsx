import { useEffect, useRef } from "react";
import { formatTimestamp, MSG_STATUS } from "../utils/mockData";

const SingleTick = () => (
  <svg viewBox="0 0 12 11" width="14" height="11" fill="var(--tick-gray)">
    <path d="M11.071.653a.45.45 0 0 0-.637 0L4.916 6.171 2.566 3.82a.45.45 0 0 0-.637.638L4.598 7.128a.45.45 0 0 0 .637 0l5.836-5.836a.45.45 0 0 0 0-.639z" />
  </svg>
);
const DoubleTickGray = () => (
  <svg viewBox="0 0 16 11" width="16" height="11" fill="var(--tick-gray)">
    <path d="M11.071.653a.45.45 0 0 0-.637 0L4.916 6.171 2.566 3.82a.45.45 0 0 0-.637.638L4.598 7.13a.45.45 0 0 0 .637 0l5.836-5.836a.45.45 0 0 0 0-.641z" />
    <path d="M15.071.653a.45.45 0 0 0-.637 0L8.916 6.171l-.956-.955a.45.45 0 0 0-.637.638l1.274 1.274a.45.45 0 0 0 .637 0l5.837-5.834a.45.45 0 0 0 0-.641z" />
  </svg>
);
const DoubleTickBlue = () => (
  <svg viewBox="0 0 16 11" width="16" height="11" fill="var(--tick-blue)">
    <path d="M11.071.653a.45.45 0 0 0-.637 0L4.916 6.171 2.566 3.82a.45.45 0 0 0-.637.638L4.598 7.13a.45.45 0 0 0 .637 0l5.836-5.836a.45.45 0 0 0 0-.641z" />
    <path d="M15.071.653a.45.45 0 0 0-.637 0L8.916 6.171l-.956-.955a.45.45 0 0 0-.637.638l1.274 1.274a.45.45 0 0 0 .637 0l5.837-5.834a.45.45 0 0 0 0-.641z" />
  </svg>
);

const TickIcon = ({ status }) => {
  switch (status) {
    case MSG_STATUS.DELIVERED: return <DoubleTickGray />;
    case MSG_STATUS.SEEN:      return <DoubleTickBlue />;
    default:                   return <SingleTick />;
  }
};

// ── File size formatter ───────────────────────────────────
const fmtSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── File content inside bubble ────────────────────────────
const FileContent = ({ message }) => {
  const { fileType, fileName, fileSize, fileUrl } = message;

  if (fileType === "image") {
    return (
      <div style={{ marginBottom: 4, borderRadius: 8, overflow: "hidden", maxWidth: 260 }}>
        <img
          src={fileUrl}
          alt={fileName}
          style={{ width: "100%", display: "block", borderRadius: 8, maxHeight: 320, objectFit: "cover" }}
        />
      </div>
    );
  }

  if (fileType === "video") {
    return (
      <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: 8, padding: "10px 12px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, maxWidth: 260 }}>
        <span style={{ fontSize: 28 }}>🎬</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", wordBreak: "break-all" }}>{fileName}</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fmtSize(fileSize)}</div>
        </div>
      </div>
    );
  }

  // document
  return (
    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 8, padding: "10px 12px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, maxWidth: 280 }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>📄</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", wordBreak: "break-all" }}>{fileName}</div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fmtSize(fileSize)}</div>
      </div>
      {fileUrl && (
        <a href={fileUrl} download={fileName} style={{ color: "var(--accent)", flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        </a>
      )}
    </div>
  );
};

// ── MessageBubble ─────────────────────────────────────────
const MessageBubble = ({ message, isOwnMessage, isFirstInGroup }) => {
  const ref = useRef(null);
  useEffect(() => { ref.current?.classList.add("animate-msg-in"); }, []);

  const formattedTime = formatTimestamp(message.timestamp || message.createdAt);
  const isFile = !!message.fileType;

  return (
    <div
      ref={ref}
      className={`flex w-full opacity-0 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      style={{ paddingLeft: isOwnMessage ? "15%" : 0, paddingRight: isOwnMessage ? 0 : "15%" }}
    >
      <div
        className={`relative max-w-full break-words px-3 py-2 text-sm
          ${isOwnMessage ? "rounded-2xl rounded-tr-sm bubble-tail-sent" : "rounded-2xl rounded-tl-sm bubble-tail-recv"}
          ${isFirstInGroup ? "mt-1" : "mt-0.5"}`}
        style={{
          background: isOwnMessage ? "var(--bubble-sent)" : "var(--bubble-recv)",
          color: "var(--text-primary)",
          boxShadow: "var(--shadow-bubble)",
        }}
      >
        {isFile && <FileContent message={message} />}

        {message.text && (
          <span className="block whitespace-pre-wrap leading-relaxed"
            style={{ fontSize: "14.2px", paddingRight: isOwnMessage ? "58px" : "44px", minWidth: "60px" }}>
            {message.text}
          </span>
        )}

        {/* Timestamp + tick */}
        <span className="absolute bottom-1.5 right-2 flex items-center gap-1"
          style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1 }}>
          {formattedTime}
          {isOwnMessage && <TickIcon status={message.status} />}
        </span>

        {/* Extra bottom padding for file messages so timestamp doesn't overlap */}
        {isFile && <div style={{ height: 16 }} />}
      </div>
    </div>
  );
};

export default MessageBubble;
