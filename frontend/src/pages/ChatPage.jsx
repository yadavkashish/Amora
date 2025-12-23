import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getSocket } from "../utils/socket";
import Chats from "../components/Chats";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChatPage() {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatMeta, setChatMeta] = useState(null); // status, initiatedBy, chatId
  const [messageText, setMessageText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  


  useEffect(() => {
    const fetchMe = async () => {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setCurrentUser(res.data.user);
    };

    fetchMe();
  }, []);

  // ================= SOCKET INIT =================
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = getSocket();
    socketRef.current.emit("join-room", currentUser._id);

    socketRef.current.on("receive-message", (msg) => {
      if (msg.sender === selectedUser?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socketRef.current.on("notification", () => {
      fetchChatUsers();
    });

    return () => {
      socketRef.current?.off("receive-message");
      socketRef.current?.off("notification");
    };
  }, [currentUser, selectedUser]);

  // ================= FETCH CHAT LIST =================
  const fetchChatUsers = async () => {
    const res = await axios.get(`${API_URL}/api/chat`, {
      withCredentials: true,
    });
    setChatUsers(res.data);
  };

  // ================= FETCH MESSAGES =================
  const fetchMessages = async (user) => {
  setSelectedUser(user);
  // IMPORTANT: reset scroll memory BEFORE clearing
prevMessageCountRef.current = 0;
  setMessages([]);

  const metaRes = await axios.get(
    `${API_URL}/api/chat/meta/${user._id}`,
    { withCredentials: true }
  );

  console.log("🧠 CHAT META:", metaRes.data);
  setChatMeta(metaRes.data);

  if (metaRes.data?.status === "ACCEPTED") {
    const msgRes = await axios.get(
      `${API_URL}/api/messages/${user._id}`,
      { withCredentials: true }
    );
    setMessages(msgRes.data);
  }
};


  useEffect(() => {
    fetchChatUsers();
  }, []);

  useEffect(() => {
  // Only scroll if a new message was ADDED
  if (messages.length > prevMessageCountRef.current) {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  prevMessageCountRef.current = messages.length;
}, [messages]);


  // ================= ACTIONS =================

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const res = await axios.post(
      `${API_URL}/api/messages/${selectedUser._id}`,
      { content: messageText },
      { withCredentials: true }
    );

    socketRef.current.emit("send-message", {
      receiverId: selectedUser._id,
      ...res.data,
    });

    setMessages((prev) => [...prev, res.data]);
    setMessageText("");
  };

  const acceptRequest = async () => {
    await axios.put(
      `${API_URL}/api/chat/${chatMeta.chatId}/accept`,
      {},
      { withCredentials: true }
    );
    setChatMeta({ ...chatMeta, status: "ACCEPTED" });
    fetchMessages(selectedUser);
  };

  const blockUser = async () => {
    await axios.put(
      `${API_URL}/api/chat/${chatMeta.chatId}/block`,
      {},
      { withCredentials: true }
    );
    setSelectedUser(null);
    fetchChatUsers();
  };

  // ================= RENDER =================

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center text-zinc-400">
        Loading chats...
      </div>
    );
  }

  const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // stop new line
    sendMessage();
  }
};


  return (
    <div className="h-screen pl-80 pr-80 pt-14 flex bg-[#05030a] text-white overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-[360px] border-r border-white/10">
        <Chats
          users={chatUsers}
          currentUserId={currentUser._id}
          selectedUserId={selectedUser?._id}
          onSelectUser={fetchMessages}
        />
      </div>

      {/* RIGHT CHAT PANEL */}
      <div className="flex-1 flex flex-col relative">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="px-6 py-4 border-b border-white/10 font-semibold">
              {selectedUser.name}
            </div>

            {/* REQUEST BANNER */}
            {chatMeta?.status === "REQUESTED" &&
 chatMeta.initiatedBy !== currentUser._id.toString() && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="m-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
                >
                  <p className="text-yellow-300 text-sm mb-3">
                    This user wants to chat with you
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={acceptRequest}
                      className="px-4 py-2 bg-green-500 rounded-lg font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={blockUser}
                      className="px-4 py-2 bg-red-500 rounded-lg font-semibold"
                    >
                      Block
                    </button>
                  </div>
                </motion.div>
              )}

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`max-w-[70%] px-4 py-2 rounded-xl ${
                    msg.sender === currentUser._id
                      ? "ml-auto bg-pink-500 text-white"
                      : "bg-white/10"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            {chatMeta?.status === "ACCEPTED" && (
              <div className="p-4 border-t border-white/10 flex gap-3">
                <input
  value={messageText}
  onChange={(e) => setMessageText(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Type a message..."
  className="flex-1 bg-white/5 px-4 py-2 rounded-xl outline-none"
/>

                <button
                type="button"
                  onClick={sendMessage}
                  className="px-5 py-2 bg-pink-500 rounded-xl font-semibold"
                >
                  Send
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
