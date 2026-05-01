const configureSocket = (io) => {
  io.on("connection", (socket) => {
    // Minimal socket bootstrap for scaffold stage.
    socket.emit("connected", { ok: true });
  });
};

export default configureSocket;
