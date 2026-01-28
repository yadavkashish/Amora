import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getSocket } from "../utils/socket";
import Chats from "../components/Chats";
import ChatWindow from "../components/ChatWindow";
import RequestsList from "../components/RequestsList"; // ⭐ IMPORTANT

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatPage() {
  const [chatUsers, setChatUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("messages");

  const socketRef = useRef(null);

  // ================== FETCH AUTH USER ==================
  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/me`, { withCredentials: true })
      .then((res) => {
        setCurrentUser(res.data.user);
      });
  }, []);

  // ================== FETCH CHAT USERS ==================
  const fetchChatUsers = async () => {
    const res = await axios.get(`${API_URL}/api/chat`, {
      withCredentials: true,
    });
    setChatUsers(res.data);
  };

  // ================== FETCH REQUESTS ==================
  const fetchRequests = async () => {
    const res = await axios.get(`${API_URL}/api/chat/requests/list`, {
      withCredentials: true,
    });
    setRequests(res.data);
  };

  useEffect(() => {
    fetchChatUsers();
    fetchRequests();
  }, []);

  // ================== SOCKET SETUP ==================
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = getSocket();
    socketRef.current.emit("join-room", currentUser._id);

    socketRef.current.on("notification", () => {
      fetchChatUsers();
      fetchRequests();
    });

    return () => {
      socketRef.current?.off("notification");
    };
  }, [currentUser]);

  // ================== ACCEPT / REJECT ==================
  const handleAcceptRequest = async (chatId) => {
  await axios.put(
    `${API_URL}/api/chat/${chatId}/accept`,
    {},
    { withCredentials: true }
  );

  await fetchRequests();
  await fetchChatUsers();  // refresh chat list

  setTab("messages"); // go back to messages automatically
};


  const handleDeleteRequest = async (chatId) => {
    await axios.put(
      `${API_URL}/api/chat/${chatId}/reject`,
      {},
      { withCredentials: true }
    );
    fetchRequests();
  };

  // ================== SELECT CHAT ==================
  const fetchMessages = async (user) => {
    setSelectedUser(user);
  };

  // ================== RENDER ==================
  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center text-zinc-400">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="h-screen pt-14 flex bg-[#05030a] text-white overflow-hidden">
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-[360px] border-r border-white/10 flex flex-col">
        {/* Tabs */}
        <div className="flex justify-between px-5 mt-4 mb-2">
          <button
            onClick={() => setTab("messages")}
            className={`pb-2 ${
              tab === "messages"
                ? "text-white font-bold border-b-2 border-pink-500"
                : "text-zinc-500"
            }`}
          >
            Messages
          </button>

          <button
            onClick={() => setTab("requests")}
            className={`pb-2 relative ${
              tab === "requests"
                ? "text-white font-bold border-b-2 border-pink-500"
                : "text-zinc-500"
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="ml-2 text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "messages" && (
            <Chats
              users={chatUsers}
              currentUserId={currentUser._id}
              selectedUserId={selectedUser?._id}
              onSelectUser={fetchMessages}
            />
          )}

          {tab === "requests" && (
            <RequestsList
              requests={requests}
              onAccept={handleAcceptRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </div>
      </div>

      {/* ================= RIGHT CHAT PANEL ================= */}
      <div className="flex-1 flex flex-col relative">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Select a chat to start messaging
          </div>
        ) : (
          <ChatWindow
            selectedUser={selectedUser}
            currentUserId={currentUser._id}
            onBack={() => setSelectedUser(null)}
          />
        )}
      </div>
    </div>
  );
}
