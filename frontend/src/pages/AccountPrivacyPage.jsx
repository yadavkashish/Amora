import React, { useEffect, useState } from "react";
import axios from "axios";
import SettingsSidebar from "../components/SettingsSidebar";

const API_URL = import.meta.env.VITE_API_URL;

/* =====================================================
   Toggle Switch (ON = Private)
===================================================== */
function ToggleSwitch({ isOn, onToggle, disableAnimation }) {
  return (
    <div
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer
        ${isOn ? "bg-pink-600" : "bg-zinc-600"}`}
    >
      <div
        className={`
          w-5 h-5 bg-white rounded-full shadow-md transform
          ${disableAnimation ? "" : "transition"}
          ${isOn ? "translate-x-6" : "translate-x-0"}
        `}
      ></div>
    </div>
  );
}

export default function AccountPrivacyPage() {
  const [privacy, setPrivacy] = useState("private"); // default ON
  const [showModal, setShowModal] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  /* =====================================================
     Load privacy from backend — prevent animation
  ===================================================== */
  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/me`, { withCredentials: true })
      .then((res) => {
        setPrivacy(res.data.user.privacy || "private");
        setTimeout(() => setInitialLoad(false), 10); // disables animation
      })
      .catch(() => setPrivacy("private"));
  }, []);

  /* =====================================================
     Toggle Logic
  ===================================================== */
  const handleToggleClick = () => {
    if (privacy === "private") {
      // Attempting to go Public (needs modal)
      setShowModal(true);
    } else {
      // Public → Private instantly
      updatePrivacy("private");
    }
  };

  /* =====================================================
     Update Privacy in Backend
  ===================================================== */
  const updatePrivacy = async (newValue) => {
    try {
      await axios.put(
        `${API_URL}/api/profile/privacy`,
        { privacy: newValue },
        { withCredentials: true },
      );

      setPrivacy(newValue);
    } catch (err) {
      console.error("Failed to update privacy:", err);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-[#0b0a10] text-white flex relative">
      {/* Sidebar — stay LEFT only */}
      <div className="relative z-10">
        <SettingsSidebar />
      </div>

      {/* MAIN CONTENT — always clickable */}
      <main className="flex-1 px-6 md:px-10 lg:px-16 pb-20 relative z-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Account Privacy</h1>

          <p className="text-zinc-500 mb-8">
            Control who can see your profile and match with you.
          </p>

          {/* CARD */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl shadow-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Private Account</h2>

              <ToggleSwitch
                isOn={privacy === "private"}
                disableAnimation={initialLoad}
                onToggle={handleToggleClick}
              />
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed">
              {privacy === "private"
                ? "Only students from your college domain will see your profile and appear in your recommendations."
                : "Your profile becomes visible to Gmail users and students from your domain."}
            </p>
          </div>
        </div>
      </main>

      {/* =====================================================
         MODAL — Private → Public confirmation
      ===================================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#111015] w-[90%] max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10">
              <h2 className="text-xl font-semibold text-center">
                Switch to public account?
              </h2>
            </div>

            <div className="px-6 py-5 space-y-5 text-zinc-300 text-sm">
              <div className="flex gap-3">
                <div className="text-pink-400 text-xl">🌐</div>
                <p>Gmail users + your college domain can view your profile.</p>
              </div>

              <div className="flex gap-3">
                <div className="text-blue-400 text-xl">👀</div>
                <p>You will appear in wider recommendations.</p>
              </div>

              <div className="flex gap-3">
                <div className="text-purple-400 text-xl">🔗</div>
                <p>Basic details may be visible outside your domain.</p>
              </div>

              <div className="flex gap-3">
                <div className="text-yellow-400 text-xl">⚠️</div>
                <p>You can switch back to private anytime.</p>
              </div>
            </div>

            <div className="border-t border-white/10">
              <button
                onClick={() => {
                  updatePrivacy("public");
                  setShowModal(false);
                }}
                className="w-full py-4 text-blue-400 font-semibold hover:bg-white/5"
              >
                Switch to public
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-4 text-zinc-400 font-semibold hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
