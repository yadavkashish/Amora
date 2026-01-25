import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ONLY job: call backend
export const sendChatRequest = async (receiverId, noteText = null) => {
  return axios.post(
    `${BASE_URL}/api/chat/request`,
    { receiverId, note: noteText },
    { withCredentials: true },
  );
};

export const acceptChatRequest = (chatId) =>
  axios.put(
    `${BASE_URL}/api/chat/${chatId}/accept`,
    {},
    { withCredentials: true },
  );

export const blockChat = (chatId) =>
  axios.put(
    `${BASE_URL}/api/chat/${chatId}/block`,
    {},
    { withCredentials: true },
  );

export const getMyChats = () =>
  axios.get(`${BASE_URL}/api/chat`, { withCredentials: true });
