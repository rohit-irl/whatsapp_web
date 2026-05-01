import { useEffect, useRef, useState } from "react";

// ── Toast for camera not-supported ───────────────────────
const Toast = ({ msg }) => (
  <div
    className="animate-slide-up-fade"
    style={{
      position: "fixed",
      bottom: "90px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#323739",
      color: "#fff",
      borderRadius: "8px",
      padding: "10px 18px",
      fontSize: "13px",
      zIndex: 200,
      pointerEvents: "none",
      whiteSpace: "nowrap",
    }}
  >
    {msg}
  </div>
);

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── AttachMenu ────────────────────────────────────────────
const AttachMenu = ({ isOpen, onClose, onFileSelected }) => {
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);
  const docInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelected({ fileType: "document", file, fileUrl: null });
    e.target.value = "";
    onClose();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const fileUrl = URL.createObjectURL(file);
    onFileSelected({ fileType: isVideo ? "video" : "image", file, fileUrl });
    e.target.value = "";
    onClose();
  };

  if (!isOpen && !toast) return null;

  const menuItems = [
    {
      icon: "📄",
      label: "Document",
      subtitle: "Share any file type",
      color: "#5157ae",
      action: () => docInputRef.current?.click(),
    },
    {
      icon: "🖼️",
      label: "Photos & Videos",
      subtitle: "Share images or videos",
      color: "#0063cb",
      action: () => photoInputRef.current?.click(),
    },
    {
      icon: "📷",
      label: "Camera",
      subtitle: "Take a photo",
      color: "#d3396d",
      action: () => { showToast("Camera is not supported in the browser"); onClose(); },
    },
  ];

  return (
    <>
      {/* Hidden file inputs */}
      <input ref={docInputRef} type="file" accept="*/*" style={{ display: "none" }} onChange={handleDocChange} />
      <input ref={photoInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handlePhotoChange} />

      {isOpen && (
        <div
          ref={menuRef}
          className="animate-slide-up-fade"
          style={{
            position: "absolute",
            bottom: "72px",
            left: "44px",
            background: "var(--bg-sidebar)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
            zIndex: 100,
            overflow: "hidden",
            minWidth: "220px",
          }}
        >
          {menuItems.map(({ icon, label, subtitle, color, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {toast && <Toast msg={toast} />}
    </>
  );
};

export { formatBytes };
export default AttachMenu;
