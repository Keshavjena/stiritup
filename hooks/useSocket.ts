import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(); // Defaults to same domain/port
    }
    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount, we want the connection to persist across page navigations in the game
    };
  }, []);

  return socket;
};
