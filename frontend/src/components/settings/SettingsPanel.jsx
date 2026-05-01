import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, saveLastSeen, saveProfile } from "../../utils/mockData";

// ── iOS-style Toggle (pure CSS, no package) ───────────────
const Toggle = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} role="switch" aria-checked={on}
    style={{ width:51, height:31, borderRadius:16, background: on?"#00a884":"var(--text-secondary)",
      cursor:"pointer", position:"relative", flexShrink:0, transition:"background 250ms" }}>
    <div style={{ position:"absolute", width:27, height:27, borderRadius:"50%", background:"#fff",
      top:2, left: on?22:2, transition:"left 250ms cubic-bezier(0.4,0,0.2,1)",
      boxShadow:"0 2px 6px rgba(0,0,0,0.28)" }} />
  </div>
);

// ── Colored icon circle ────────────────────────────────────
const IconCircle = ({ bg, children }) => (
  <div style={{ width:36, height:36, borderRadius:"50%", background:bg, display:"flex",
    alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
    {children}
  </div>
);

// ── Shared sub-components ─────────────────────────────────
const Sel = ({ value, opts, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ background:"var(--bg-input)", color:"var(--text-primary)", border:"1px solid var(--border-subtle)", borderRadius:6, padding:"6px 10px", fontSize:13, outline:"none" }}>
    {opts.map(o => <option key={o}>{o}</option>)}
  </select>
);
const Row = ({ label, sub, children }) => (
  <div style={{ padding:"14px 28px", borderBottom:"1px solid var(--bg-divider)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
    <div>
      <div style={{ fontSize:14, color:"var(--text-primary)" }}>{label}</div>
      {sub && <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:2 }}>{sub}</div>}
    </div>
    {children}
  </div>
);
const SectionHdr = ({ title }) => (
  <div style={{ padding:"20px 28px 4px", fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>{title}</div>
);
const SecLabel = ({ t }) => (
  <div style={{ padding:"16px 28px 6px", fontSize:11, fontWeight:700, color:"var(--text-secondary)", letterSpacing:"0.08em", textTransform:"uppercase" }}>{t}</div>
);
const ComingSoon = ({ icon="🔧" }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, gap:12, opacity:0.4 }}>
    <div style={{ fontSize:52 }}>{icon}</div>
    <div style={{ fontSize:15, color:"var(--text-secondary)" }}>Coming soon</div>
  </div>
);

const SHORTCUTS = [
  ["New chat","Ctrl + N"],["Search","Ctrl + F"],["Next chat","Ctrl + Tab"],
  ["Mark as read","Ctrl + Shift + U"],["Archive","Ctrl + Shift + A"],
  ["Mute","Ctrl + Shift + M"],["Delete chat","Ctrl + Backspace"],
];

const CATS = [
  { id:"profile",   icon:"👤", bg:"#00a884", label:"Profile",            sub:"Name, profile photo" },
  { id:"general",   icon:"🖥️", bg:"#1d7abf", label:"General",            sub:"Startup and close" },
  { id:"privacy",   icon:"🔒", bg:"#8b5cf6", label:"Privacy",            sub:"Last seen, read receipts" },
  { id:"chats",     icon:"💬", bg:"#f97316", label:"Chats",              sub:"Theme, wallpaper, font size" },
  { id:"notifs",    icon:"🔔", bg:"#be185d", label:"Notifications",      sub:"Messages, sounds, desktop" },
  { id:"shortcuts", icon:"⌨️", bg:"#0891b2", label:"Keyboard shortcuts", sub:"Quick actions" },
  { id:"help",      icon:"❓", bg:"#059669", label:"Help & feedback",    sub:"App info, links" },
];

// ── RightPanel ────────────────────────────────────────────
const RightPanel = ({ cat, currentUser, onProfileSave }) => {
  const saved = loadProfile();
  const [name,    setName]    = useState(saved?.name    || currentUser?.username || "User");
  const [about,   setAbout]   = useState(saved?.about   || "Hey there! I am using WhatsApp.");
  const [photo,   setPhoto]   = useState(saved?.photoBase64 || null);
  const [editName, setEditName]= useState(false);
  const [savedOk,  setSavedOk] = useState(false);
  const [lastSeen, setLastSeen]= useState("Everyone");
  const [profPhoto,setProfPhoto]=useState("Everyone");
  const [aboutVis, setAboutVis]= useState("Everyone");
  const [readRec,  setReadRec] = useState(true);
  const [msgNotif, setMsgNotif]= useState(true);
  const [sounds,   setSounds]  = useState(true);
  const [desktop,  setDesktop] = useState(false);
  const [preview,  setPreview] = useState(true);
  const [openLogin,setOpenLogin]=useState(true);
  const [fontSize, setFontSize]= useState(14);
  const [wallpaper,setWallpaper]=useState("#efeae2");
  const [enterSend,setEnterSend]=useState(true);
  const [theme,    setTheme]   = useState(() => localStorage.getItem("wa_theme") || "Light");
  const fileRef = useRef(null);

  const applyTheme = (t) => {
    setTheme(t);
    localStorage.setItem("wa_theme", t);
    document.documentElement.classList.toggle("dark", t === "Dark");
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file); e.target.value = "";
  };
  const handleSave = () => {
    const p = { name, about, photoBase64: photo };
    saveProfile(p); onProfileSave?.(p);
    try { const u = JSON.parse(localStorage.getItem("chat_user")||"{}"); localStorage.setItem("chat_user", JSON.stringify({...u, username:name})); } catch {}
    setEditName(false); setSavedOk(true); setTimeout(() => setSavedOk(false), 2200);
  };

  const inputStyle = { width:"100%", background:"transparent", border:"none", borderBottom:"2px solid #00a884", color:"var(--text-primary)", fontSize:15, padding:"4px 0 6px", outline:"none", marginTop:4 };

  switch (cat) {
    case "profile": return (
      <div>
        <SectionHdr title="Profile" />
        <div style={{ borderBottom:"1px solid var(--border-subtle)" }} />
        <div style={{ padding:"28px", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
          {/* Avatar + hover overlay */}
          <div style={{ position:"relative", cursor:"pointer" }} onClick={() => fileRef.current?.click()}>
            {photo
              ? <img src={photo} alt="av" style={{ width:100, height:100, borderRadius:"50%", objectFit:"cover" }} />
              : <div style={{ width:100, height:100, borderRadius:"50%", background:"linear-gradient(135deg,#00a884,#007d5e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, fontWeight:700, color:"#fff" }}>{name[0]?.toUpperCase()}</div>
            }
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 200ms" }}
              onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
              <span style={{ color:"#fff", fontSize:12, fontWeight:600, textAlign:"center" }}>📷<br />Change</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhotoChange} />
          </div>
          {/* Name */}
          <div style={{ width:"100%", maxWidth:380 }}>
            <div style={{ fontSize:12, color:"var(--text-secondary)" }}>Your name</div>
            {editName
              ? <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input style={{ ...inputStyle, flex:1 }} value={name} maxLength={25}
                    onChange={e => setName(e.target.value)} autoFocus
                    onKeyDown={e => { if(e.key==="Enter") handleSave(); if(e.key==="Escape") setEditName(false); }} />
                  <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{25-name.length}</span>
                  <button onClick={handleSave} style={{ border:"none", background:"none", cursor:"pointer", color:"#00a884", fontSize:20 }}>✓</button>
                </div>
              : <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontSize:16, color:"var(--text-primary)", paddingTop:6 }}>{name}</div>
                  <button onClick={() => setEditName(true)} style={{ border:"none", background:"none", cursor:"pointer", color:"var(--text-secondary)", fontSize:16 }}>✏️</button>
                </div>
            }
          </div>
          {/* About */}
          <div style={{ width:"100%", maxWidth:380 }}>
            <div style={{ fontSize:12, color:"var(--text-secondary)" }}>About</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <input style={{ ...inputStyle, flex:1 }} value={about} maxLength={139}
                onChange={e => setAbout(e.target.value)} />
              <span style={{ fontSize:11, color:"var(--text-secondary)", flexShrink:0 }}>{139-about.length}</span>
            </div>
          </div>
          {/* Phone */}
          <div style={{ width:"100%", maxWidth:380 }}>
            <div style={{ fontSize:12, color:"var(--text-secondary)" }}>Phone</div>
            <div style={{ fontSize:15, color:"var(--text-secondary)", paddingTop:6 }}>🇮🇳 +91 98765 43210</div>
          </div>
          {/* Save button */}
          <div style={{ width:"100%", maxWidth:380, display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={handleSave}
              style={{ flex:1, padding:"11px 0", border:"none", borderRadius:24, background:"#00a884", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", transition:"background 150ms" }}
              onMouseEnter={e => e.currentTarget.style.background="#029e7d"}
              onMouseLeave={e => e.currentTarget.style.background="#00a884"}>
              Save Changes
            </button>
            {savedOk && <span style={{ fontSize:13, color:"#00a884", fontWeight:600, whiteSpace:"nowrap" }}>✓ Saved!</span>}
          </div>
        </div>
      </div>
    );

    case "general": return (
      <div>
        <SectionHdr title="General" /><div style={{ borderBottom:"1px solid var(--border-subtle)" }} />
        <SecLabel t="Startup" />
        <Row label="Open WhatsApp at login" sub="Launch automatically when you log in"><Toggle on={openLogin} onChange={setOpenLogin} /></Row>
        <SecLabel t="Appearance" />
        <Row label="Theme" sub="Choose how WhatsApp looks to you">
          <div style={{ display:"flex", background:"var(--bg-input)", borderRadius:24, padding:3, gap:2, border:"1px solid var(--border-subtle)" }}>
            {["Light","Dark"].map(t => (
              <button key={t} onClick={() => applyTheme(t)}
                style={{ padding:"6px 16px", border:"none", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600,
                  background: theme===t?"#00a884":"transparent", color: theme===t?"#fff":"var(--text-secondary)",
                  transition:"background 150ms, color 150ms" }}>
                {t==="Light"?"☀️ Light":"🌙 Dark"}
              </button>
            ))}
          </div>
        </Row>
      </div>
    );

    case "privacy": return (
      <div>
        <SectionHdr title="Privacy" /><div style={{ borderBottom:"1px solid var(--border-subtle)" }} />
        <SecLabel t="Visibility" />
        <Row label="Last seen & online"><Sel value={lastSeen} opts={["Everyone","My contacts","Nobody"]} onChange={setLastSeen} /></Row>
        <Row label="Profile photo"><Sel value={profPhoto} opts={["Everyone","My contacts","Nobody"]} onChange={setProfPhoto} /></Row>
        <Row label="About"><Sel value={aboutVis} opts={["Everyone","My contacts","Nobody"]} onChange={setAboutVis} /></Row>
        <SecLabel t="Messaging" />
        <Row label="Read receipts" sub="When off, you won't send or receive read receipts"><Toggle on={readRec} onChange={setReadRec} /></Row>
      </div>
    );

    case "chats": return (
      <div>
        <SectionHdr title="Chats" /><div style={{ borderBottom:"1px solid var(--border-subtle)" }} />
        <SecLabel t="Chat wallpaper" />
        <div style={{ padding:"12px 28px 16px", borderBottom:"1px solid var(--bg-divider)", display:"flex", gap:10, flexWrap:"wrap" }}>
          {["#efeae2","#d9e8ff","#ffecd2","#e8d5f5","#d4f5e2","#fff0f0","#e0f0ff","#f5f0ff"].map(c => (
            <div key={c} onClick={() => setWallpaper(c)} title={c}
              style={{ width:42, height:42, borderRadius:8, background:c, cursor:"pointer",
                border: wallpaper===c?"3px solid #00a884":"2px solid var(--border-subtle)", transition:"border 120ms" }} />
          ))}
        </div>
        <SecLabel t="Font size" />
        <div style={{ padding:"14px 28px", borderBottom:"1px solid var(--bg-divider)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:11, color:"var(--text-secondary)" }}>Small</span>
            <input type="range" min={12} max={20} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={{ flex:1, accentColor:"#00a884" }} />
            <span style={{ fontSize:11, color:"var(--text-secondary)" }}>Large</span>
          </div>
          <div style={{ textAlign:"center", marginTop:8, fontSize, color:"var(--text-primary)" }}>Preview text ({fontSize}px)</div>
        </div>
        <SecLabel t="Input" />
        <Row label="Enter is send" sub="Shift+Enter for new line"><Toggle on={enterSend} onChange={setEnterSend} /></Row>
      </div>
    );

    case "notifs": return (
      <div>
        <SectionHdr title="Notifications" /><div style={{ borderBottom:"1px solid var(--border-subtle)" }} />
        <SecLabel t="Messages" />
        <Row label="Message notifications" sub="Get notified for new messages"><Toggle on={msgNotif} onChange={setMsgNotif} /></Row>
        <Row label="Sounds" sub="Play sound for new messages"><Toggle on={sounds} onChange={setSounds} /></Row>
        <SecLabel t="Desktop" />
        <Row label="Desktop alerts" sub="Show browser notifications"><Toggle on={desktop} onChange={setDesktop} /></Row>
        <Row label="Show message preview" sub="See message content in alerts"><Toggle on={preview} onChange={setPreview} /></Row>
      </div>
    );

    case "shortcuts": return (
      <div>
        <SectionHdr title="Keyboard shortcuts" /><div style={{ borderBottom:"1px solid var(--border-subtle)" }} />
        {SHORTCUTS.map(([action, key]) => (
          <div key={action} style={{ padding:"14px 28px", borderBottom:"1px solid var(--bg-divider)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:14, color:"var(--text-primary)" }}>{action}</span>
            <kbd style={{ background:"var(--bg-input)", color:"var(--text-secondary)", padding:"4px 12px", borderRadius:6, fontSize:12, fontFamily:"monospace", border:"1px solid var(--border-subtle)" }}>{key}</kbd>
          </div>
        ))}
      </div>
    );

    case "help": return (
      <div>
        <SectionHdr title="Help & feedback" /><div style={{ borderBottom:"1px solid var(--border-subtle)" }} />
        <div style={{ padding:"16px 28px", borderBottom:"1px solid var(--bg-divider)" }}>
          <div style={{ fontSize:14, color:"var(--text-primary)" }}>WhatsApp Web Clone</div>
          <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:2 }}>Version 1.0.0 · Built with React + Vite</div>
        </div>
        {[["WhatsApp FAQ","https://faq.whatsapp.com/"],["Privacy policy","https://www.whatsapp.com/legal/privacy-policy/"],["Terms of service","https://www.whatsapp.com/legal/terms-of-service"]].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 28px", borderBottom:"1px solid var(--bg-divider)", textDecoration:"none", color:"var(--text-primary)", fontSize:14 }}
            onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <span>{label}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-secondary)"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </a>
        ))}
      </div>
    );

    default: return <ComingSoon />;
  }
};

// ── SettingsPanel ─────────────────────────────────────────
const SettingsPanel = ({ onBack, currentUser, onProfileSave }) => {
  const [cat, setCat] = useState("profile");
  const [catSearch, setCatSearch] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const saved = loadProfile();

  const handleLogout = () => {
    if (currentUser?._id) saveLastSeen(currentUser._id);
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const filteredCats = CATS.filter(c =>
    !catSearch || c.label.toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <div style={{ display:"flex", height:"100%", fontFamily:"'Nunito','Segoe UI',sans-serif", background:"var(--bg-sidebar-header)" }}>

      {/* ── Left panel ── */}
      <div style={{ width:340, minWidth:340, background:"var(--bg-sidebar-header)", display:"flex", flexDirection:"column", borderRight:"1px solid var(--border-subtle)" }}>

        {/* Header */}
        <div style={{ height:59, display:"flex", alignItems:"center", gap:14, padding:"0 16px", borderBottom:"1px solid var(--border-subtle)", flexShrink:0 }}>
          <button onClick={onBack} style={{ border:"none", background:"transparent", cursor:"pointer", color:"var(--text-secondary)", display:"flex", padding:4, borderRadius:"50%" }}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <span style={{ fontSize:17, fontWeight:700, color:"var(--text-primary)" }}>Settings</span>
        </div>

        {/* Profile summary row */}
        <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:14, borderBottom:"1px solid var(--border-subtle)", cursor:"pointer",
            background: cat==="profile"?"var(--bg-sidebar)":"transparent" }}
          onClick={() => setCat("profile")}
          onMouseEnter={e=>{ if(cat!=="profile") e.currentTarget.style.background="var(--bg-hover)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background= cat==="profile"?"var(--bg-sidebar)":"transparent"; }}>
          {saved?.photoBase64
            ? <img src={saved.photoBase64} alt="p" style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
            : <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#00a884,#007d5e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:700, color:"#fff", flexShrink:0 }}>{(saved?.name||currentUser?.username||"U")[0].toUpperCase()}</div>
          }
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>{saved?.name||currentUser?.username||"User"}</div>
            <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:2 }}>{saved?.about||"Hey there! I am using WhatsApp."}</div>
          </div>
        </div>

        {/* Category search */}
        <div style={{ padding:"8px 12px", borderBottom:"1px solid var(--border-subtle)" }}>
          <input type="text" value={catSearch} onChange={e=>setCatSearch(e.target.value)}
            placeholder="Search settings…"
            style={{ width:"100%", background:"var(--bg-input)", border:"none", borderRadius:8, padding:"7px 12px", fontSize:13, outline:"none", color:"var(--text-primary)", caretColor:"#00a884", boxSizing:"border-box" }} />
        </div>

        {/* Category list */}
        <div className="scrollbar-wa" style={{ flex:1, overflowY:"auto" }}>
          {filteredCats.map(({ id, icon, bg, label, sub }) => {
            const isActive = cat===id;
            return (
              <button key={id}
                style={{ display:"flex", alignItems:"center", gap:14, width:"100%", padding:"10px 16px", border:"none", cursor:"pointer", textAlign:"left",
                  background: isActive?"var(--bg-sidebar)":"transparent",
                  borderLeft: isActive?"3px solid #00a884":"3px solid transparent",
                  minHeight:52, transition:"background 120ms" }}
                onClick={() => setCat(id)}
                onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background="var(--bg-hover)"; }}
                onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background="transparent"; }}>
                <IconCircle bg={bg}>{icon}</IconCircle>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color: isActive?"#00a884":"var(--text-primary)" }}>{label}</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:1 }}>{sub}</div>
                </div>
                {/* › arrow */}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-secondary)" style={{ opacity:0.5 }}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            );
          })}

          {/* Log out */}
          <div style={{ borderTop:"1px solid var(--border-subtle)", marginTop:"auto" }}>
            <button style={{ display:"flex", alignItems:"center", gap:14, width:"100%", padding:"10px 16px", border:"none", cursor:"pointer", textAlign:"left", background:"transparent", minHeight:52 }}
              onClick={() => setShowLogout(true)}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(241,92,109,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <IconCircle bg="#f15c6d">🚪</IconCircle>
              <div style={{ fontSize:14, fontWeight:600, color:"#f15c6d" }}>Log out</div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Right panel — slide animation on cat change ── */}
      <div key={cat} className="scrollbar-wa animate-settings-slide"
        style={{ flex:1, background:"var(--bg-sidebar)", overflowY:"auto" }}>
        <RightPanel cat={cat} currentUser={currentUser} onProfileSave={onProfileSave} />
      </div>

      {/* Logout modal */}
      {showLogout && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}>
          <div style={{ background:"var(--bg-sidebar)", borderRadius:12, padding:"28px 32px", maxWidth:340, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:17, fontWeight:700, color:"var(--text-primary)", marginBottom:10 }}>Log out?</div>
            <div style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:24, lineHeight:1.6 }}>Are you sure you want to log out? Your messages are end-to-end encrypted and stored securely.</div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setShowLogout(false)}
                style={{ padding:"9px 20px", border:"1px solid var(--border-subtle)", borderRadius:20, background:"transparent", color:"var(--text-primary)", fontSize:13, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={handleLogout}
                style={{ padding:"9px 20px", border:"none", borderRadius:20, background:"#f15c6d", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
