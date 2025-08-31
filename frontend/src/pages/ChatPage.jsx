'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chats from "../components/Chats";
import ChatWindow from "../components/ChatWindow";
import { getSocket } from "../utils/socket";

export default function ChatPage() {
  const { userId } = useParams(); // Optional userId param for direct chat
  const [users, setUsers] = useState([]); // Chat list users
  const [selectedUser, setSelectedUser] = useState(null); // Current chat
  const [currentUserId, setCurrentUserId] = useState(null); // Logged-in user ID
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Mobile detection
  const API_URL = import.meta.env.VITE_API_URL; // Base API URL
  const socket = getSocket(); // Socket instance

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        setCurrentUserId(res.data.user?._id || null);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, [API_URL]);

  // Fetch chat list (users)
  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/messages`, { withCredentials: true });
        setUsers(res.data);
        console.log("💬 Messages fetched:", res.data);
      } catch (err) {
        console.error("❌ Error fetching chat list:", err);
      }
    };

    fetchChatList();
  }, [API_URL]);

  // Handle direct navigation via userId param
  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profile/user/${userId}`, { withCredentials: true });
        const profile = res.data;
        const newUser = {
          _id: profile.user._id,
          name: profile.user.name,
          profilePic: profile.profilePic,
        };
        setUsers(prev => prev.some(u => u._id === newUser._id) ? prev : [...prev, newUser]);
        handleSelectUser(newUser); // use updated select handler
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [userId, API_URL]);

  // Join socket room for current user
  useEffect(() => {
    if (!currentUserId) return;
    socket.emit("join", String(currentUserId));
  }, [currentUserId, socket]);

  // Update chat list on new messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      setUsers(prev =>
        prev.map(u =>
          u._id === msg.sender || u._id === msg.receiver
            ? { ...u, lastMessage: msg.content, timestamp: msg.timestamp, unreadCount: (u.unreadCount || 0) + 1 }
            : u
        )
      );
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  // 🟢 Handle selecting a chat (mark messages read)
  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    try {
      await axios.put(`${API_URL}/api/messages/seen/${user._id}`, {}, { withCredentials: true });


      // Update frontend immediately
      setUsers(prev =>
        prev.map(u =>
          u._id === user._id ? { ...u, unreadCount: 0 } : u
        )
      );
    } catch (err) {
      console.error("❌ Error marking messages as read:", err);
    }
  };

  return (
    <div className="h-screen pt-21 flex bg-gray-50">

      {/* Desktop layout */}
      {!isMobile && (
        <>
          <aside className="w-72 border-r border-gray-200 bg-white overflow-y-auto">
            <Chats
              users={users}
              currentUserId={currentUserId}
              selectedUserId={selectedUser?._id}
              onSelectUser={handleSelectUser} // ✅ updated handler
            />
          </aside>

          <main className="flex-1 flex flex-col overflow-x-hidden">
            {currentUserId === null ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Loading...
              </div>
            ) : selectedUser ? (
              <ChatWindow
                selectedUser={selectedUser}
                currentUserId={currentUserId}
                API_URL={API_URL}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 px-4">
                Select a chat to start messaging
              </div>
            )}
          </main>
        </>
      )}

      {/* Mobile layout */}
      {isMobile && (
        <main className="flex-1 flex flex-col overflow-x-hidden">
          {currentUserId === null ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Loading...
            </div>
          ) : selectedUser ? (
            <ChatWindow
              selectedUser={selectedUser}
              currentUserId={currentUserId}
              API_URL={API_URL}
              onBack={() => setSelectedUser(null)}
            />
          ) : (
            <Chats
              users={users}
              currentUserId={currentUserId}
              selectedUserId={selectedUser?._id}
              onSelectUser={handleSelectUser} // ✅ updated handler
            />
          )}
        </main>
      )}

    </div>
  );
}
