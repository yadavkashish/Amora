'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chats from "../components/Chats";
import ChatWindow from "../components/ChatWindow";
import { getSocket } from "../utils/socket";
import { MessageSquareDashed, Loader2, Sparkles } from "lucide-react";

// --- SHARED UI COMPONENTS ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 bg-[#05030a]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 0%, rgba(244, 63, 94, 0.15), transparent 50%),
          radial-gradient(circle at 90% 100%, rgba(168, 85, 247, 0.15), transparent 50%),
          radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.1), transparent 50%)
        `,
      }}
    />
    <div className="absolute inset-0 opacity-[0.2] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
  </div>
);

export default function ChatPage() {
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const API_URL = import.meta.env.VITE_API_URL;
  const socket = getSocket();

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
        handleSelectUser(newUser);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [userId, API_URL]);

  // Join socket room
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

  // Handle selecting a chat
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      await axios.put(`${API_URL}/api/messages/seen/${user._id}`, {}, { withCredentials: true });
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
    <div className="relative h-screen w-full bg-[#05030a] text-slate-200 overflow-hidden pt-20">
      <BackgroundGrid />

      {/* Main Container */}
      <div className="h-[calc(100vh-90px)] max-w-[1600px] mx-auto p-4 md:p-6">
        <div className="flex h-full w-full rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          
          {/* Desktop Layout */}
          {!isMobile && (
            <>
              {/* Sidebar */}
              <aside className="w-80 md:w-96 border-r border-white/10 bg-white/5 flex flex-col">
                <div className="p-5 border-b border-white/10 bg-black/20">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquareDashed className="text-pink-500" /> Messages
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <Chats
                    users={users}
                    currentUserId={currentUserId}
                    selectedUserId={selectedUser?._id}
                    onSelectUser={handleSelectUser}
                  />
                </div>
              </aside>

              {/* Main Chat Area */}
              <main className="flex-1 flex flex-col bg-transparent relative">
                {currentUserId === null ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-500">
                    <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
                    <p>Syncing messages...</p>
                  </div>
                ) : selectedUser ? (
                  <ChatWindow
                    selectedUser={selectedUser}
                    currentUserId={currentUserId}
                    API_URL={API_URL}
                  />
                ) : (
                  // Empty State for Desktop
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(236,72,153,0.15)] border border-white/5">
                        <Sparkles className="w-10 h-10 text-pink-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Pick a Conversation</h3>
                    <p className="text-zinc-400 max-w-sm">
                        Select a match from the sidebar to start chatting or connecting with your campus peers.
                    </p>
                  </div>
                )}
              </main>
            </>
          )}

          {/* Mobile Layout */}
          {isMobile && (
            <main className="flex-1 flex flex-col w-full bg-transparent">
              {currentUserId === null ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    <p>Loading...</p>
                </div>
              ) : selectedUser ? (
                <ChatWindow
                  selectedUser={selectedUser}
                  currentUserId={currentUserId}
                  API_URL={API_URL}
                  onBack={() => setSelectedUser(null)}
                />
              ) : (
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/10 bg-black/20">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            Messages
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <Chats
                            users={users}
                            currentUserId={currentUserId}
                            selectedUserId={selectedUser?._id}
                            onSelectUser={handleSelectUser}
                        />
                    </div>
                </div>
              )}
            </main>
          )}
        </div>
      </div>
    </div>
  );
}