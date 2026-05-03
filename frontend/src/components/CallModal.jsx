import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

const HangupIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
  </svg>
);

const CallModal = ({ callData, onAccept, onReject, onEnd }) => {
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (callData.status === "active") {
      timerRef.current = setInterval(() => setTimer((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callData.status]);

  const fmtTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  const isIncoming = callData.status === "incoming";
  const isCalling = callData.status === "calling";
  const isActive = callData.status === "active";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(11, 20, 26, 0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            overflow: "hidden",
            margin: "0 auto 20px",
            border: "4px solid var(--accent)",
            padding: 4,
          }}
        >
          {callData.avatar ? (
            <img src={callData.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 48, fontWeight: 700
            }}>
              {callData.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <h2 style={{ fontSize: 28, margin: "0 0 8px" }}>{callData.username}</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", margin: 0 }}>
          {isIncoming ? "Incoming " : isCalling ? "Calling... " : ""}
          {callData.type === "video" ? "Video Call" : "Voice Call"}
          {isActive && ` (${fmtTime(timer)})`}
        </p>
      </div>

      <div style={{ display: "flex", gap: 30 }}>
        {isIncoming ? (
          <>
            <button
              onClick={onReject}
              style={{
                width: 64, height: 64, borderRadius: "50%", background: "#f15c6d", border: "none",
                color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}
              title="Decline"
            >
              <HangupIcon />
            </button>
            <button
              onClick={onAccept}
              style={{
                width: 64, height: 64, borderRadius: "50%", background: "#00a884", border: "none",
                color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}
              title="Accept"
            >
              {callData.type === "video" ? <VideoIcon /> : <PhoneIcon />}
            </button>
          </>
        ) : (
          <button
            onClick={onEnd}
            style={{
              width: 64, height: 64, borderRadius: "50%", background: "#f15c6d", border: "none",
              color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
            title="End Call"
          >
            <HangupIcon />
          </button>
        )}
      </div>

      {(isCalling || isIncoming) && (
        <div style={{ marginTop: 40 }}>
          <div className="call-pulse" style={{
            width: 10, height: 10, borderRadius: "50%", background: "var(--accent)",
            animation: "pulse 1.5s infinite"
          }} />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; box-shadow: 0 0 0 0 rgba(0, 168, 132, 0.7); }
          70% { transform: scale(1); opacity: 0.7; box-shadow: 0 0 0 20px rgba(0, 168, 132, 0); }
          100% { transform: scale(0.8); opacity: 1; box-shadow: 0 0 0 0 rgba(0, 168, 132, 0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CallModal;
