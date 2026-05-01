// Typing indicator — three bouncing dots inside a received bubble
// Light theme: white bubble with subtle shadow (same as recv bubble)
const TypingIndicator = () => (
  <div className="flex justify-start px-3 py-1 animate-msg-in">
    <div
      className="relative flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3 bubble-tail-recv"
      style={{
        background: "var(--bubble-recv)",
        boxShadow: "var(--shadow-bubble)",
      }}
    >
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

export default TypingIndicator;
