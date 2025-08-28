import { io } from "socket.io-client";

let socket = null;

// Initialize socket only once
export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      withCredentials: true,
    });
  }
  return socket;
};
