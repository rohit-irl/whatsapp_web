const CommunitiesPanel = () => (
  <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 20px", background: "var(--bg-sidebar-header)", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Communities</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <div style={{ fontSize: 64, opacity: 0.25 }}>👥</div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Communities</h2>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.5 }}>
            Communities bring together related groups. Create yours or discover existing ones.
          </p>
        </div>
        <button style={{ padding: "10px 24px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "24px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
          New community
        </button>
      </div>
    </div>
  </div>
);

export default CommunitiesPanel;
