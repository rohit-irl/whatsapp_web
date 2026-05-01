import { useEffect, useRef, useState } from "react";

// ── Emoji data ────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "smileys", label: "Smileys", icon: "😀",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤧","🥵","🥶","😵","🤯","🤠","🥳","😎","🤓","😕","😟","🙁","☹️","😮","😲","😳","🥺","😢","😭","😱","😠","😡","🤬","💀","👻","👽","🤖"],
  },
  {
    id: "people", label: "People", icon: "👋",
    emojis: ["👋","🤚","🖐️","✋","🖖","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🤲","🙏","🤝","💪","🦾","🦵","🦶","👂","👃","👀","👅","👄","💋","🧠","🦷"],
  },
  {
    id: "animals", label: "Animals", icon: "🐶",
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🦋","🐛","🐌","🐞","🐜","🦂","🐢","🐍","🦎","🐙","🐠","🐟","🐬","🐳","🦈","🐊","🐅","🦓","🦍","🐘","🦛","🐪","🦒","🦘"],
  },
  {
    id: "food", label: "Food", icon: "🍎",
    emojis: ["🍎","🍊","🍋","🍇","🍓","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🧄","🧅","🥔","🥚","🍳","🍞","🥐","🥖","🧀","🍖","🍗","🥩","🥓","🌭","🍔","🍟","🍕","🌮","🌯","🍜","🍣","🍱","🧁","🎂","🍰","🍩","🍪","🍫","🍬","🍭","🍦","🧃","☕","🍵","🍺","🍻","🥂","🍷","🥃","🍸","🍹"],
  },
  {
    id: "travel", label: "Travel", icon: "🌍",
    emojis: ["🌍","🌎","🌏","🗺️","🧭","⛰️","🌋","🏔️","🏕️","🏖️","🏜️","🏝️","🏟️","🏛️","🏠","🏡","🏢","🏥","🏦","🏨","🏪","🏫","🏭","🏯","🏰","⛪","🕌","🕍","⛩️","🕋","⛲","🚂","🚃","🚄","🚅","🚇","🚌","🚑","🚒","🚓","🚕","🚗","🛻","🚚","🚛","🚜","🏎️","🏍️","🛵","🚲","🛴","🚁","🚀","✈️","🛩️","🚤","🛥️","🚢","⛵","🛶"],
  },
  {
    id: "objects", label: "Objects", icon: "💻",
    emojis: ["⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","💽","💾","💿","📀","📷","📸","📹","🎥","📞","☎️","📺","📻","🧭","⏱️","⏰","⌛","📡","🔋","🔌","💡","🔦","🕯️","💸","💵","💰","💎","⚖️","🧰","🔧","🔨","🛠️","🔩","🔬","🔭","💊","🩺","🩹","🧴","🧷","🧹","🧺","🧼","🪥","🪒"],
  },
  {
    id: "symbols", label: "Symbols", icon: "❤️",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","☮️","✝️","☪️","✡️","☯️","🛐","⚡","🌟","⭐","✨","💫","✅","❎","💯","🔔","🔕","🔇","🔊","♻️","🔴","🟠","🟡","🟢","🔵","🟣","⬛","⬜","🔺","🔻","🔷","🔶","🔸","🔹","🔱","⚠️","🆗","🆙","🆒","🆕","ℹ️","🔃","🔄","▶️","⏸️","⏹️","⏺️","🎵","🎶"],
  },
];

// ── EmojiPicker ───────────────────────────────────────────
const EmojiPicker = ({ isOpen, onClose, onEmojiSelect }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("smileys");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter emojis across all categories when searching
  const searchResults = search
    ? CATEGORIES.flatMap((c) => c.emojis).filter((e) =>
        e.includes(search)
      )
    : null;

  const displayCategory = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div
      ref={ref}
      className="animate-slide-up-fade"
      style={{
        position: "absolute",
        bottom: "72px",
        left: "4px",
        width: "340px",
        background: "var(--bg-sidebar)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search */}
      <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid var(--border-subtle)" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji…"
          autoFocus
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "none",
            borderRadius: "20px",
            padding: "7px 14px",
            fontSize: "13px",
            outline: "none",
            color: "var(--text-primary)",
            caretColor: "#00a884",
          }}
        />
      </div>

      {/* Category tabs */}
      {!search && (
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", padding: "2px 4px 0" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              title={cat.label}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "18px",
                padding: "6px 2px",
                cursor: "pointer",
                borderBottom: activeCategory === cat.id ? "2px solid #00a884" : "2px solid transparent",
                transition: "border-color 120ms",
                lineHeight: 1,
              }}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Category label */}
      {!search && (
        <div style={{ padding: "8px 12px 2px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {displayCategory?.label}
        </div>
      )}

      {/* Emoji grid */}
      <div
        className="scrollbar-wa"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: "1px",
          padding: "4px 8px 10px",
          maxHeight: "220px",
          overflowY: "auto",
        }}
      >
        {(searchResults ?? displayCategory?.emojis ?? []).map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => {
              onEmojiSelect(emoji);
            }}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "22px",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              transition: "background 80ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {emoji}
          </button>
        ))}
        {searchResults?.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "20px 0", color: "var(--text-secondary)", fontSize: "13px" }}>
            No results
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;
