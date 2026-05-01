const StatusPanel = () => (
  <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "var(--bg-sidebar-header)", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Status</span>
        <button style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <div style={{ fontSize: 64, opacity: 0.25 }}>🔄</div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Status updates</h2>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.5 }}>
            Share photos, text and emoji updates that disappear in 24 hours.
            <br/><br/>
            No recent updates from your contacts.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StatusPanel;
