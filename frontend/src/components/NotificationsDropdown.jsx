import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { playNotificationSound } from "../utils/playSound";

const API_URL = import.meta.env.VITE_API_URL;

export default function NotificationsDropdown({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        withCredentials: true,
      });
      setNotifs(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto play sound on NEW notification
  const prevCount = useRef(0);
  const muteSound = localStorage.getItem("muteNotificationSound") === "true";

  useEffect(() => {
    if (!muteSound && notifs.length > prevCount.current) {
      playNotificationSound();
    }
    prevCount.current = notifs.length;
  }, [notifs]);

  useEffect(() => {
    axios
      .put(
        `${API_URL}/api/notifications/seen/all`,
        {},
        { withCredentials: true },
      )
      .catch(() => {});
  }, []);

  // Accept
  const acceptRequest = async (notifId, chatId) => {
    await axios.put(
      `${API_URL}/api/notifications/${notifId}/accept`,
      {},
      { withCredentials: true },
    );

    fetchNotifications();

    // ⭐ Force chat list reload in ChatPage
    if (window.refreshChats) window.refreshChats();
  };

  // Reject
  const rejectRequest = async (notifId, chatId) => {
    await axios.put(
      `${API_URL}/api/notifications/${notifId}/reject`,
      { chatId },
      { withCredentials: true },
    );
    fetchNotifications();
  };

  return (
    <div className="absolute right-4 top-16 w-96 bg-black/85 backdrop-blur-xl border border-white/10 rounded-xl p-5 z-50 shadow-xl">
      <h3 className="text-white font-semibold mb-4">Notifications</h3>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {loading && (
          <div className="text-zinc-400 text-center py-4">Loading...</div>
        )}

        {!loading &&
          notifs.map((n) => (
            <div
              key={n._id}
              className="p-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <img
                  src={n.fromUser?.profilePic}
                  className="w-12 h-12 rounded-full"
                />

                <div className="text-sm text-white flex-1 leading-tight">
                  <b>{n.fromUser?.name}</b>{" "}
                  {n.type === "CHAT_REQUEST" && "sent you a chat request"}
                  {n.type === "REQUEST_ACCEPTED" && "accepted your request"}
                </div>
              </div>

              {n.type === "CHAT_REQUEST" && n.requestStatus === "pending" && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => acceptRequest(n._id, n.chatId?._id)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() => rejectRequest(n._id, n.chatId?._id)}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}

              {n.requestStatus === "accepted" && (
                <p className="text-green-400 text-xs mt-2">
                  You accepted this request
                </p>
              )}

              {n.requestStatus === "rejected" && (
                <p className="text-red-400 text-xs mt-2">
                  You rejected this request
                </p>
              )}
            </div>
          ))}

        {!loading && notifs.length === 0 && (
          <div className="text-zinc-400 text-center py-6">No notifications</div>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 py-2 rounded-lg bg-white/10 text-pink-400"
      >
        Close
      </button>
    </div>
  );
}
