import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import useSocket from "../hooks/useSocket";

const Chat = () => {
  const socket = useSocket();
  const [currentUser] = useState(() => {
    const storedUser = localStorage.getItem("chat_user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!socket || !currentUser?._id) return;
    socket.emit("join", currentUser._id);
  }, [socket, currentUser?._id]);

  const fetchMessages = async (user = selectedUser) => {
    if (!currentUser?._id || !user?._id) return;

    try {
      setLoadingMessages(true);
      setError("");
      const { data } = await api.get(`/messages/${currentUser._id}/${user._id}`);
      setMessages(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    await fetchMessages(user);
  };

  useEffect(() => {
    if (!currentUser?._id || !selectedUser?._id) return;

    const pollMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${currentUser._id}/${selectedUser._id}`);
        setMessages(data);
      } catch {
        // Silent polling errors; explicit actions show full errors.
      }
    };

    const intervalId = setInterval(() => {
      pollMessages();
    }, 6000);

    return () => clearInterval(intervalId);
  }, [selectedUser?._id, currentUser?._id]);

  const handleMessageSent = (message) => {
    setMessages((previous) => [...previous, message]);
  };

  const handleReceiveMessage = (message) => {
    setMessages((previous) => {
      const exists = previous.some((item) => item._id && item._id === message._id);
      if (exists) return previous;
      return [...previous, message];
    });
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
  );

  if (!localStorage.getItem("chat_user")) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar
        currentUser={currentUser}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
      />

      <section className="flex w-full flex-col md:w-[70%]">
        {error ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {loadingMessages ? (
          <div className="border-b border-gray-200 bg-white px-4 py-2 text-sm text-gray-500">
            Loading messages...
          </div>
        ) : null}

        <ChatWindow
          currentUser={currentUser}
          selectedUser={selectedUser}
          messages={sortedMessages}
          onMessageSent={handleMessageSent}
          onReceiveMessage={handleReceiveMessage}
        />
      </section>
    </main>
  );
};

export default Chat;
