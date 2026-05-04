import { useEffect, useState } from "react";
import api from "../../api/axios";

const CallIcon = ({ type, status }) => {
  const isVideo = type === "video";
  const isMissed = status === "missed";
  
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: isMissed ? "rgba(241, 92, 109, 0.1)" : "rgba(0, 168, 132, 0.1)",
      color: isMissed ? "#f15c6d" : "#00a884"
    }}>
      {isVideo ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      )}
    </div>
  );
};

const CallsPanel = ({ currentUser, activePanel, onStartNewCall }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      console.log("CallsPanel: Fetching calls for user:", currentUser?._id);
      if (!currentUser?._id) {
        console.warn("CallsPanel: No currentUser._id found");
        return;
      }
      try {
        const { data } = await api.get(`/calls/${currentUser._id}`);
        console.log("CallsPanel: Received calls:", data);
        setCalls(data);
      } catch (error) {
        console.error("CallsPanel: Failed to fetch calls:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, [currentUser?._id, activePanel]);

  const formatDuration = (s) => {
    if (!s) return "";
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      height: "100%", 
      background: "var(--bg-sidebar)",
      width: "100%",
      maxWidth: 400,
      borderRight: "1px solid var(--border-subtle)"
    }}>
      <div style={{ 
        height: 60, 
        display: "flex", 
        alignItems: "center", 
        padding: "0 20px", 
        background: "var(--bg-sidebar-header)", 
        borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0
      }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Calls</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-sidebar)" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "var(--text-secondary)" }}>
            Loading calls...
          </div>
        ) : calls.length === 0 ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100%", 
            padding: 40,
            textAlign: "center"
          }}>
            <div style={{ 
              width: 180, 
              height: 180, 
              marginBottom: 24, 
              borderRadius: "50%",
              background: "rgba(0, 168, 132, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}>
              <img 
                src="/no-calls.png" 
                alt="No calls" 
                style={{ 
                  width: "120%", 
                  height: "120%", 
                  objectFit: "contain",
                  opacity: 0.8
                }} 
              />
            </div>
            <h3 style={{ 
              color: "var(--text-primary)", 
              margin: "0 0 12px",
              fontSize: 20,
              fontWeight: 500
            }}>
              No calls yet
            </h3>
            <p style={{ 
              color: "var(--text-secondary)", 
              fontSize: 14, 
              margin: "0 0 32px", 
              lineHeight: 1.6,
              maxWidth: 280
            }}>
              Recent calls will appear here. You can start a new call from your chats.
            </p>
            <div style={{
              padding: "10px 24px",
              borderRadius: 24,
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "transform 0.2s, background 0.2s"
            }}
            className="start-call-btn"
            onClick={onStartNewCall}
            >
              Start a new call
            </div>
          </div>
) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {calls.map((call) => {
              const isCaller = String(call.caller?._id || call.caller) === String(currentUser?._id);
              const partnerObj = isCaller ? call.receiver : call.caller;
              const partnerName = typeof partnerObj === "object" ? partnerObj?.username : partnerObj;
              const partnerAvatar = typeof partnerObj === "object" ? partnerObj?.avatar : null;
              
              return (
                <div key={call._id} className="call-item" style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  gap: 12,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  borderBottom: "1px solid var(--border-subtle)"
                }}>
                  <div style={{ position: "relative" }}>
                    {partnerAvatar ? (
                      <img src={partnerAvatar} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ 
                        width: 48, height: 48, borderRadius: "50%", 
                        background: "#ccc", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 700, color: "#fff"
                      }}>
                        {partnerName?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ 
                        fontWeight: 600, 
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {partnerName || "Unknown User"}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {formatTime(call.createdAt)}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 4,
                        color: call.status === "missed" ? "#f15c6d" : "inherit"
                      }}>
                        {isCaller ? (
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ color: call.status === "missed" ? "#f15c6d" : "#00a884", transform: "rotate(135deg)" }}>
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ color: call.status === "missed" ? "#f15c6d" : "#00a884", transform: "rotate(-45deg)" }}>
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                          </svg>
                        )}
                        {isCaller ? "Outgoing" : "Incoming"}
                        {call.status === "missed" && " (Missed)"}
                        {call.status === "rejected" && " (Declined)"}
                        {call.duration > 0 && ` • ${formatDuration(call.duration)}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ color: "var(--accent)" }}>
                    <CallIcon type={call.type} status={call.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .call-item:hover {
          background: var(--bg-sidebar-hover);
        }
        .start-call-btn:hover {
          background: #019d7d;
          transform: scale(1.05);
        }
        .start-call-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default CallsPanel;
