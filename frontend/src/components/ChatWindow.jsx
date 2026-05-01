import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import useSocket from "../hooks/useSocket";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";

const getId = (value) => (typeof value === "object" ? value?._id : value);

const ChatWindow = ({ currentUser, selectedUser, messages, onMessageSent, onReceiveMessage }) => {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const socket = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return undefined;

    const handleReceiveMessage = (incomingMessage) => {
      if (!currentUser?._id || !selectedUser?._id) return;

      const senderId = getId(incomingMessage.sender);
      const receiverId = getId(incomingMessage.receiver);
      const shouldAppend =
        senderId === selectedUser._id && receiverId === currentUser._id;

      if (shouldAppend) {
        onReceiveMessage(incomingMessage);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, currentUser?._id, selectedUser?._id, onReceiveMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUser?._id || !currentUser?._id) {
      setError("Please select a user first.");
      return;
    }

    if (!draft.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const { data } = await api.post("/messages", {
        sender: currentUser._id,
        receiver: selectedUser._id,
        text: draft.trim(),
      });

      onMessageSent(data);
      socket?.emit("sendMessage", data);
      setDraft("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative flex flex-1 w-full flex-col bg-[#efeae2]">
      {!selectedUser ? (
        <div className="flex h-full flex-col items-center justify-center border-b-[6px] border-green-500 bg-[#f0f2f5]">
          <div className="mb-6 rounded-full bg-white p-6 shadow-sm">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="mb-2 text-3xl font-light text-gray-700">WhatsApp Web</h2>
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      ) : (
        <>
          <ChatHeader selectedUser={selectedUser} />

          <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-xs rounded-lg bg-white/50 py-2 text-center shadow-sm">
                <p className="text-gray-500">No messages yet. Say hello!</p>
              </div>
            ) : null}

            {messages.map((message) => (
              <MessageBubble
                key={message._id || `${getId(message.sender)}-${message.timestamp}`}
                message={message}
                isOwnMessage={getId(message.sender) === currentUser?._id}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="bg-[#f0f2f5] px-4 py-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a message"
                disabled={isSending}
                className="w-full rounded-full border-none bg-white px-5 py-3 text-sm text-gray-800 shadow-sm outline-none placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {isSending ? (
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
            {error ? <p className="mt-1 pl-4 text-xs text-red-600">{error}</p> : null}
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
