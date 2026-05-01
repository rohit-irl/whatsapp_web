const MessageBubble = ({ message, isOwnMessage }) => {
  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[70%] px-3 py-1.5 text-sm shadow-sm ${
          isOwnMessage
            ? "rounded-lg rounded-tr-sm bg-[#d9fdd3] text-[#111b21]"
            : "rounded-lg rounded-tl-sm bg-white text-[#111b21]"
        }`}
      >
        <div className="flex flex-col">
          <span className="pr-12 text-[14.2px] leading-relaxed">{message.text}</span>
          <span className="absolute bottom-1 right-2 text-[10px] text-gray-500">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
