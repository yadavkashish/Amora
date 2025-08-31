import { io } from "socket.io-client";

let socket = null;

// Initialize socket only once
export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"], // ensures connection
    });
  }
  return socket;
};
