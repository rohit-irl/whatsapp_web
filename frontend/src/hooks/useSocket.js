import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

const useSocket = () => {
  const context = useContext(SocketContext);
  return context?.socket ?? null;
};

export default useSocket;
