import { createContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketUrl = apiUrl.replace(/\/api\/?$/, "");

    return io(socketUrl, {
      transports: ["websocket", "polling"],
    });
  }, []);

  useEffect(
    () => () => {
      socket.disconnect();
    },
    [socket]
  );

  const value = useMemo(() => ({ socket }), [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
