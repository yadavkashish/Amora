import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api",
  withCredentials: true,
});

export const sendChatRequest = async (receiverId, noteText = null) => {
  return api.post("/chat/request", {
    receiverId,
    note: noteText,
  });
};

export const acceptChatRequest = (chatId) =>
  api.put(`/chat/${chatId}/accept`);

export const blockChat = (chatId) =>
  api.put(`/chat/${chatId}/block`);

export const getMyChats = () =>
  api.get("/chat");
