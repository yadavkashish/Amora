import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { formatTime } from "../utils/time";
import { getSocket } from "../utils/socket";

export default function ChatWindow({ selectedUser, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef();
  const socket = getSocket();

  useEffect(() => {
    socket.on("seenMessage", ({ userId }) => {
      if (userId === selectedUser._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?.toString?.() === currentUserId?.toString()
              ? { ...m, seen: true }
              : m
          )
        );
      }
    });

    return () => socket.off("seenMessage");
  }, [socket, selectedUser, currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      axios
        .put(
          `http://localhost:5000/api/messages/seen/${selectedUser._id}`,
          {},
          { withCredentials: true }
        )
        .then(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.sender?.toString?.() === selectedUser._id?.toString()
                ? { ...m, seen: true }
                : m
            )
          );
        })
        .catch(() => {});
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    axios
      .get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("📥 Messages fetched:", res.data);
        setMessages(res.data);
      })
      .catch(() => {});
  }, [selectedUser]);

  useEffect(() => {
    socket.on("newMessage", (msg) => {
      if (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) {
        console.log("📩 New message received:", msg);
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("newMessage");
  }, [socket, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/messages/${selectedUser._id}`,
        {
          content: newMessage,
        },
        { withCredentials: true }
      );
      console.log("📤 Message sent:", res.data);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      socket.emit("sendMessage", res.data);
    } catch {}
  };
  const handleDeleteMessage = async (id) => {
  try {
    await axios.put(`http://localhost:5000/api/messages/delete/${id}`, {}, { withCredentials: true });
    setMessages((prev) => prev.filter((m) => m._id !== id)); // remove locally
  } catch (err) {
    console.error("❌ Delete failed:", err);
  }
};

  return (
  <div className="flex-1 flex flex-col h-full">
    {/* Header */}
    <div className="px-4 py-3 border-b flex items-center gap-3 bg-white">
      <img
        src={
          selectedUser.profilePic
            ? `http://localhost:5000/uploads/${selectedUser.profilePic}`
            : "https://via.placeholder.com/80"
        }
        alt={selectedUser.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <h2 className="text-gray-900 font-medium">{selectedUser.name}</h2>
    </div>

    {/* ✅ Messages Container (scrollable) */}
    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
      {messages.map((msg, i) => {
        const senderId = msg.sender?.toString?.() || msg.sender;
        const isSender = senderId === currentUserId?.toString();

        return (
         <div
  key={msg._id}
  onContextMenu={(e) => {
    e.preventDefault();
    if (window.confirm("Delete this message for you?")) {
      handleDeleteMessage(msg._id);
    }
  }}
  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
>
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs shadow relative ${
                isSender
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-900 border"
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-[10px] block text-right opacity-70 mt-1">
                {formatTime(msg.timestamp)}
              </span>

              {/* ✅ Seen ticks only for sender */}
              {isSender && (
                <span className="text-[12px] block text-right mt-1">
                  {msg.seen ? (
                    <span className="text-blue-500">✓✓</span>
                  ) : (
                    <span className="text-gray-400">✓✓</span>
                  )}
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>

    {/* Input */}
    <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
      >
        Send
      </button>
    </form>
  </div>
);

}
