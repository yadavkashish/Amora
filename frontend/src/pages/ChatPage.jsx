import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chats from "../components/Chats";
import ChatWindow from "../components/ChatWindow";
import { getSocket } from "../utils/socket";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { userId } = useParams(); // 👈 get userId from route
  const socket = getSocket();

  useEffect(() => {
    // ✅ Get logged-in user
    axios
      .get("http://localhost:5000/api/auth/me", { withCredentials: true })
      .then(res => {
        console.log("👤 Auth response:", res.data);
        if (res.data?.user?._id) {
          setCurrentUserId(res.data.user._id);
          console.log("✅ Current User ID set to:", res.data.user._id);
        } else {
          console.warn("⚠️ No user ID found in auth response");
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch /auth/me:", err);
      });

    // ✅ Fetch chat list
    axios
      .get("http://localhost:5000/api/messages", { withCredentials: true })
      .then(res => {
        setUsers(res.data);
        console.log("💬 Messages fetched:", res.data);
      })
      .catch(err => {
        console.error("❌ Failed to fetch messages:", err);
      });
  }, []);

  // ✅ Auto-select user if navigated from dashboard
  useEffect(() => {
    if (!userId) return;

    const existing = users.find(u => u._id === userId);
    if (existing) {
      setSelectedUser(existing);
    } else {
      axios
        .get(`http://localhost:5000/api/profile/user/${userId}`, {
          withCredentials: true,
        })
        .then(res => {
          const profile = res.data;
          const newUser = {
            _id: profile.user._id,
            name: profile.user.name,
            profilePic: profile.profilePic,
          };

          setUsers(prev => {
            const exists = prev.some(u => u._id === newUser._id);
            return exists ? prev : [...prev, newUser];
          });

          setSelectedUser(newUser);
        })
        .catch(err => {
          console.error("❌ Failed to fetch profile:", err);
        });
    }
  }, [userId, users]);

  // ✅ Handle socket new messages
  useEffect(() => {
    socket.on("newMessage", msg => {
      console.log("📩 New message via socket:", msg);

      setUsers(prev =>
        prev.map(u =>
          u._id === msg.sender || u._id === msg.receiver
            ? { ...u, lastMessage: msg.content, timestamp: msg.timestamp }
            : u
        )
      );
    });

    return () => socket.off("newMessage");
  }, [socket]);

  // ✅ Join socket room when user ID is ready
  useEffect(() => {
    if (currentUserId) {
      console.log("🔌 Joining socket room:", currentUserId);
      socket.emit("join", String(currentUserId));
    }
  }, [currentUserId, socket]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Chats
        users={users}
        currentUserId={currentUserId}
        selectedUserId={selectedUser?._id}
        onSelectUser={setSelectedUser}
      />

      {/* Main chat */}
      <main className="flex-1 h-full flex flex-col">
        {currentUserId === null ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Loading...
          </div>
        ) : selectedUser ? (
          <ChatWindow selectedUser={selectedUser} currentUserId={currentUserId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </main>
    </div>
  );
}
