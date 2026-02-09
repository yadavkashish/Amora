import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import { ChevronRight } from "lucide-react";
import SettingsSidebar from "../components/SettingsSidebar";

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";


export default function SettingsPage() {
  const [blockedUsers, setBlockedUsers] = useState([]);

  const [privacy, setPrivacy] = useState("private");

useEffect(() => {
  axios
    .get(`${API_URL}/api/auth/me`, { withCredentials: true })
    .then(res => setPrivacy(res.data.user.privacy));
}, []);

const togglePrivacy = async () => {
  const newValue = privacy === "public" ? "private" : "public";
  setPrivacy(newValue);
  await axios.put(`${API_URL}/api/users/privacy`,
    { privacy: newValue },
    { withCredentials: true }
  );
};

  const [muteSound, setMuteSound] = useState(
    localStorage.getItem("muteNotificationSound") === "true"
  );

  const toggleNotificationSound = () => {
    const newValue = !muteSound;
    setMuteSound(newValue);
    localStorage.setItem("muteNotificationSound", newValue);
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/chat/blocked/list`, { withCredentials: true })
      .then((res) => setBlockedUsers(res.data));
  }, []);

  const handleUnblock = async (chatId) => {
    await axios.put(
      `${API_URL}/api/chat/${chatId}/unblock`,
      {},
      { withCredentials: true }
    );
    setBlockedUsers((prev) => prev.filter((u) => u.chatId !== chatId));
  };

  return (
    <div className="pt-24 min-h-screen bg-[#0b0a10] text-white flex">
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <SettingsSidebar />

      {/* ---------------- RIGHT CONTENT ---------------- */}
      <main className="flex-1 px-6 md:px-10 lg:px-16 pb-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>

          <p className="text-zinc-500 mb-8">
            Manage your privacy, blocked users & account preferences
          </p>

          {/* CARD */}
          <div
            className="
            bg-white/[0.03] 
            border border-white/10 
            rounded-2xl 
            shadow-xl
            p-6
            backdrop-blur-sm
          "
          >
            <h2 className="text-xl font-semibold mb-4">Blocked Users</h2>

            {blockedUsers.length === 0 ? (
              <p className="text-zinc-500">You haven't blocked anyone.</p>
            ) : (
              <div className="space-y-4">
                {blockedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="
                      flex items-center justify-between 
                      p-4 rounded-xl 
                      bg-white/[0.02] 
                      border border-white/5
                    "
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={u.profilePic}
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                      />
                      <span className="text-white font-medium">{u.name}</span>
                    </div>

                    <button
                      onClick={() => handleUnblock(u.chatId)}
                      className="
                        px-4 py-2 text-sm 
                        rounded-full
                        bg-pink-600 hover:bg-pink-700
                        transition-colors
                      "
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-600 text-center mt-10">
            Amora © {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ label, active, to }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => to && navigate(to)}
      className={`
        flex items-center justify-between w-full
        px-3 py-3 rounded-lg text-left mb-1
        ${
          active
            ? "bg-white/10 text-white font-medium"
            : "hover:bg-white/5 text-zinc-300"
        }
      `}
    >
      <span>{label}</span>
      <ChevronRight size={18} />
    </button>
  );
}
