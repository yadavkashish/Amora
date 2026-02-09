"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { formatTime } from "../utils/time";
import { getSocket } from "../utils/socket";
import {
  FiSend,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiTrash2,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";

export default function ChatWindow({ selectedUser, currentUserId, onBack }) {
  const isDeleted = selectedUser?.isDeleted;

  if (isDeleted) {
    return (
      <div className="center text-red-400">This account has been deleted.</div>
    );
  }

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef();
  const socket = getSocket();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";

  const [showMenu, setShowMenu] = useState(false);
  const isBlocked = selectedUser.blockedBy === currentUserId;
  const IAmBlocked =
    selectedUser.blockedBy && selectedUser.blockedBy !== currentUserId;

  // ✅ Resize listener for mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Join the user's room on connect
  useEffect(() => {
    if (currentUserId) {
      socket.emit("join-room", String(currentUserId));
    }
  }, [currentUserId, socket]);

  // ✅ Listen for "seenMessage" updates
  useEffect(() => {
    const handleSeen = ({ userId }) => {
      if (userId === selectedUser._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?.toString() === currentUserId?.toString()
              ? { ...m, seen: true }
              : m,
          ),
        );
      }
    };
    socket.on("seenMessage", handleSeen);
    return () => socket.off("seenMessage", handleSeen);
  }, [socket, selectedUser, currentUserId]);

  // ✅ Mark messages as seen when opening chat
  useEffect(() => {
    if (!selectedUser) return;
    axios
      .put(
        `${API_URL}/api/chat/seen/${selectedUser._id}`,
        {},
        { withCredentials: true },
      )
      .then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?.toString() === selectedUser._id?.toString()
              ? { ...m, seen: true }
              : m,
          ),
        );
      })
      .catch(() => {});
  }, [selectedUser]);

  // ✅ Fetch chat history
  useEffect(() => {
    if (!selectedUser) return;
    axios
      .get(`${API_URL}/api/chat/${selectedUser._id}`, {
        withCredentials: true,
      })
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [selectedUser]);

  // ✅ Listen for new messages in real-time
  useEffect(() => {
    const handleNewMessage = (msg) => {
      // 🚫 If the message was NOT delivered (blocked), do not show it
      if (msg.delivered === false && msg.receiver === currentUserId) {
        return;
      }

      // 🚫 If THEY blocked me → I shouldn't receive
      if (IAmBlocked) return;

      // 🚫 If I blocked them → I shouldn't receive their messages
      if (isBlocked && msg.sender === selectedUser._id) return;

      // ✅ Normal message flow
      if (
        msg.sender === selectedUser._id ||
        msg.receiver === selectedUser._id
      ) {
        setMessages((prev) => [...prev, msg]);

        if (window.updateChatList) {
          window.updateChatList();
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (selectedUser.isDeleted) return;
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/${selectedUser._id}`,
        { content: newMessage },
        { withCredentials: true },
      );

      // UI shows YOUR message even if not delivered
      if (res.data.delivered !== false) {
        // normal delivery
        setMessages((prev) => [...prev, res.data]);
      } else {
        // message saved but not delivered
        setMessages((prev) => [
          ...prev,
          {
            ...res.data,
            content: res.data.content,
          },
        ]);
      }

      setNewMessage("");

      // ❌ REMOVE socket.emit — backend handles delivery
    } catch (err) {
      console.error("❌ Sending message failed:", err);
    }
  };

  // ✅ Delete a specific message
  const handleDeleteMessage = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/chat/delete/${id}`,
        {},
        { withCredentials: true },
      );
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative">
      {/* --- Header --- */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          {isMobile && onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-zinc-300 transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
          )}

          <div className="relative">
            <img
              src={
                selectedUser.isDeleted
                  ? "/deleted-user.png"
                  : IAmBlocked
                    ? "/blocked-avatar.png"
                    : selectedUser.profilePic
              }
              className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-md"
            />

            {/* Online indicator placeholder */}
            {!IAmBlocked && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
            )}
          </div>

          <div>
            <h2 className="text-white font-bold text-lg leading-tight">
              {selectedUser.isDeleted ? "Deleted Account" : selectedUser.name}
            </h2>
            {/* Hide online status if they blocked me */}
            {!selectedUser.isDeleted && !IAmBlocked && (
              <p className="text-zinc-500 text-xs">Online</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 text-zinc-400">
          <FiPhone className="cursor-pointer hover:text-pink-400 transition-colors w-5 h-5" />
          <FiVideo className="cursor-pointer hover:text-pink-400 transition-colors w-5 h-5" />
          <div className="relative">
            <FiMoreVertical
              onClick={() => setShowMenu(!showMenu)}
              className="cursor-pointer hover:text-pink-400 transition-colors w-5 h-5"
            />

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 z-50">
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 z-50">
                    {/* 🟥 If YOU BLOCKED THEM → show UNBLOCK button */}
                    {isBlocked && (
                      <button
                        onClick={async () => {
                          await axios.put(
                            `${API_URL}/api/chat/${selectedUser.chatId}/unblock`,
                            {},
                            { withCredentials: true },
                          );
                          window.location.reload();
                        }}
                        className="w-full text-left px-3 py-2 text-green-400 hover:bg-white/10 rounded-md"
                      >
                        Unblock User
                      </button>
                    )}

                    {/* 🟪 If YOU ARE NOT BLOCKED → show BLOCK button */}
                    {!isBlocked && !IAmBlocked && (
                      <button
                        onClick={async () => {
                          await axios.put(
                            `${API_URL}/api/chat/${selectedUser.chatId}/block`,
                            {},
                            { withCredentials: true },
                          );
                          window.location.reload();
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/10 rounded-md"
                      >
                        Block User
                      </button>
                    )}

                    {/* 🔒 If THEY BLOCKED YOU → show disabled info */}
                    {IAmBlocked && (
                      <div className="px-3 py-2 text-zinc-500 text-sm">
                        You cannot modify block settings.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Messages Area --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => {
          const senderId = msg.sender?.toString() || msg.sender;
          const isSender = senderId === currentUserId?.toString();
          const isLastMessage = index === messages.length - 1;

          return (
            <div
              key={msg._id || index}
              className={`flex w-full ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`group relative px-5 py-3 rounded-2xl max-w-[85%] md:max-w-[70%] shadow-lg break-words text-sm md:text-base transition-all
                ${
                  isSender
                    ? "bg-gradient-to-br from-pink-600 to-purple-700 text-white rounded-tr-none"
                    : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none hover:bg-white/10"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Meta: Time + Status */}
                <div
                  className={`flex items-center gap-1 mt-1.5 text-[10px] ${
                    isSender
                      ? "justify-end text-pink-200/70"
                      : "justify-start text-zinc-500"
                  }`}
                >
                  <span>{formatTime(msg.timestamp)}</span>
                  {isSender && (
                    <span className="ml-1 flex items-center">
                      {msg.seen ? (
                        <div className="flex text-blue-300">
                          <FiCheck size={12} />
                          <FiCheck size={12} className="-ml-1.5" />
                        </div>
                      ) : (
                        <FiCheck size={12} className="text-white/50" />
                      )}
                    </span>
                  )}
                </div>

                {/* Delete Button (Hover) */}
                {isSender && (
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    title="Delete message"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {isBlocked && (
        <div className="text-center text-red-400 text-xs py-2 opacity-70">
          You have blocked this user. You cannot send messages.
        </div>
      )}
      {selectedUser.isDeleted && (
        <div className="text-center text-red-400 text-xs py-2 opacity-70">
          This account is deleted. You cannot send messages.
        </div>
      )}

      {/* --- Input Area --- */}
      {!selectedUser.isDeleted && (
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <form
            onSubmit={isBlocked ? (e) => e.preventDefault() : sendMessage}
            className="flex items-center gap-3 relative"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isBlocked}
              placeholder={
                isBlocked ? "You have blocked this user" : "Type a message..."
              }
              className={`flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder:text-zinc-500 
      focus:outline-none 
      ${isBlocked ? "opacity-50 cursor-not-allowed" : "focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"}
      transition-all shadow-inner`}
            />

            {/* Hide send button completely for blocker */}
            {!isBlocked && (
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <FiSend
                  size={18}
                  className={newMessage.trim() ? "translate-x-0.5" : ""}
                />
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
