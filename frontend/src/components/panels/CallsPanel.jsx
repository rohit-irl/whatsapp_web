const EmptyIllustration = ({ emoji, title, subtitle }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, background: "var(--bg-chat)" }}>
    <div style={{ fontSize: 72, lineHeight: 1, opacity: 0.35 }}>{emoji}</div>
    <div style={{ textAlign: "center" }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-secondary)", maxWidth: 280, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  </div>
);

const CallsPanel = () => (
  <div style={{ display: "flex", height: "100%", background: "var(--bg-sidebar)" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 20px", background: "var(--bg-sidebar-header)", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)" }}>Calls</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <div style={{ fontSize: 72, lineHeight: 1, opacity: 0.35 }}>📞</div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>No calls yet</h2>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.5 }}>
            Click on a contact to start a voice or video call.
            <br/><br/>
            Recent calls will appear here.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default CallsPanel;
