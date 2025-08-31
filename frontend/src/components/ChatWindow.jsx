'use client';

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { formatTime } from "../utils/time";
import { getSocket } from "../utils/socket";
import { 
  FiSend, FiPhone, FiVideo, FiMoreVertical, FiTrash2, FiArrowLeft 
} from "react-icons/fi";

/**
 * ChatWindow Component
 * 
 * Props:
 * - selectedUser: Object containing info of the currently selected chat user
 * - currentUserId: ID of the logged-in user
 * - onBack: Function to handle "back" action on mobile
 */
export default function ChatWindow({ selectedUser, currentUserId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(); // Ref to scroll to bottom
  const socket = getSocket();
  // Socket.io instance

  // Track mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const API_URL = import.meta.env.VITE_API_URL;

  /** Update mobile view on window resize */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** Listen for "seenMessage" events from socket */
  useEffect(() => {
    socket.on("seenMessage", ({ userId }) => {
      if (userId === selectedUser._id) {
        setMessages(prev =>
          prev.map(m =>
            m.sender?.toString() === currentUserId?.toString()
              ? { ...m, seen: true }
              : m
          )
        );
      }
    });
    return () => socket.off("seenMessage");
  }, [socket, selectedUser, currentUserId]);

  /** Mark messages as seen when opening chat */
  useEffect(() => {
    if (!selectedUser) return;
    axios.put(
      `${API_URL}api/messages/seen/${selectedUser._id}`,
      {},
      { withCredentials: true }
    ).then(() => {
      setMessages(prev =>
        prev.map(m =>
          m.sender?.toString() === selectedUser._id?.toString()
            ? { ...m, seen: true }
            : m
        )
      );
    }).catch(() => {});
  }, [selectedUser]);

  /** Fetch chat messages from backend */
  useEffect(() => {
    if (!selectedUser) return;
    axios.get(`${API_URL}/api/messages/${selectedUser._id}`, {
      withCredentials: true,
    })
      .then(res => setMessages(res.data))
      .catch(() => {});
  }, [selectedUser]);

  /** Listen for incoming messages in real-time */
  useEffect(() => {
    socket.on("newMessage", (msg) => {
      if (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => socket.off("newMessage");
  }, [socket, selectedUser]);

  /** Scroll chat to bottom whenever messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Send new message */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/messages/${selectedUser._id}`,
        { content: newMessage },
        { withCredentials: true }
      );
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
      socket.emit("sendMessage", res.data);
    } catch (err) {
      console.error("❌ Sending message failed:", err);
    }
  };

  /** Delete a specific message */
  const handleDeleteMessage = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/messages/delete/${id}`,
        {},
        { withCredentials: true }
      );
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-2 h-full bg-gray-100">

      {/* Header Section */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <button 
              onClick={onBack} 
              className="p-1 mr-2 rounded-md hover:bg-gray-200"
            >
              <FiArrowLeft size={20} />
            </button>
          )}
          <img
            src={selectedUser.profilePic 
              ? `${API_URL}/uploads/${selectedUser.profilePic}` 
              : "https://via.placeholder.com/80"}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <h2 className="text-gray-900 font-medium">{selectedUser.name}</h2>
        </div>

        <div className="flex gap-3 text-gray-600">
          <FiPhone className="cursor-pointer hover:text-pink-500" />
          <FiVideo className="cursor-pointer hover:text-pink-500" />
          <FiMoreVertical className="cursor-pointer hover:text-pink-500" />
        </div>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const senderId = msg.sender?.toString() || msg.sender;
          const isSender = senderId === currentUserId?.toString();

          return (
            <div key={msg._id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
              <div className={`group relative px-4 py-2 rounded-2xl max-w-xs shadow-md
                ${isSender 
                  ? "bg-gradient-to-r from-pink-500 to-pink-400 text-white"
                  : "bg-white text-gray-900 border"
                }`}
              >
                <p>{msg.content}</p>

                {/* Timestamp and seen indicator */}
                <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-80">
                  <span>{formatTime(msg.timestamp)}</span>
                  {isSender && (
                    <span>
                      {msg.seen 
                        ? <span className="text-blue-700">✓✓</span> 
                        : <span className="text-white">✓✓</span>}
                    </span>
                  )}
                </div>

                {/* Delete button on hover */}
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="absolute hidden group-hover:block top-1 right-1 text-xs text-white/80 hover:text-red-500"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Section */}
      <form onSubmit={sendMessage} className="p-3 border-t flex items-center gap-2 bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button type="submit" className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition">
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
}
