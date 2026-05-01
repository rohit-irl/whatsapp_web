const configureSocket = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
    });

    socket.on("sendMessage", (message) => {
      const receiverId = message?.receiver?._id || message?.receiver;
      if (!receiverId) return;

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};

export default configureSocket;
