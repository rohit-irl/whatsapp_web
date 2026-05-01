import { createContext, useMemo } from "react";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const value = useMemo(() => ({ socket: null }), []);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
