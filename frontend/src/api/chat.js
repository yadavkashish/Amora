import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const sendChatRequest = async (receiverId) => {
  return axios.post(
    `${BASE_URL}/api/chat/request`,
    { receiverId },               // ✅ MUST be an object
    { withCredentials: true }
  );
};

export const acceptChatRequest = (chatId) =>
  axios.put(
    `${BASE_URL}/api/chat/${chatId}/accept`,
    {},
    { withCredentials: true }
  );

export const blockChat = (chatId) =>
  axios.put(
    `${BASE_URL}/api/chat/${chatId}/block`,
    {},
    { withCredentials: true }
  );

export const getMyChats = () =>
  axios.get(`${BASE_URL}/api/chat`, { withCredentials: true });
