const StarredPanel = () => (
  <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 20px", background: "var(--bg-sidebar-header)", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Starred messages</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <div style={{ fontSize: 64, opacity: 0.25 }}>⭐</div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>No starred messages</h2>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.5 }}>
            Long press on any message and tap the star icon to save it here for quick access.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StarredPanel;
