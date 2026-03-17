import React, { useEffect, useState } from "react";
import axios from "axios";
import SettingsSidebar from "../components/SettingsSidebar";

const API_URL = import.meta.env.DEV ? "http://localhost:5000" : "";

/* =====================================================
   Toggle Switch (ON = Private)
===================================================== */
function ToggleSwitch({ isOn, onToggle, disableAnimation, disabled }) {
  return (
    <div
      onClick={!disabled ? onToggle : undefined}
      className={`w-12 h-6 flex items-center rounded-full p-1
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isOn ? "bg-pink-600" : "bg-zinc-600"}`}
    >
      <div
        className={`
          w-5 h-5 bg-white rounded-full shadow-md transform
          ${disableAnimation ? "" : "transition"}
          ${isOn ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </div>
  );
}


export default function AccountPrivacyPage() {
  const [privacy, setPrivacy] = useState("private"); // default ON
  const [showModal, setShowModal] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isGmailUser, setIsGmailUser] = useState(false);


  /* =====================================================
     Load privacy from backend — prevent animation
  ===================================================== */
  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/me`, { withCredentials: true })
      .then((res) => {
        const user = res.data.user;

setPrivacy(user.privacy || "private");
setIsGmailUser(user.emailDomain === "gmail.com");

setTimeout(() => setInitialLoad(false), 10);

      })
      .catch(() => setPrivacy("private"));
  }, []);

  /* =====================================================
     Toggle Logic
  ===================================================== */
  const handleToggleClick = () => {
  // ❌ Gmail users cannot go private
  if (isGmailUser) return;

  if (privacy === "private") {
    setShowModal(true);
  } else {
    updatePrivacy("private");
  }
};


  /* =====================================================
     Update Privacy in Backend
  ===================================================== */
  const updatePrivacy = async (newValue) => {
    try {
      await axios.put(
        `${API_URL}/api/auth/privacy`,
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
              <h2 className="text-xl font-semibold">
  Private Account
  {isGmailUser && (
    <span className="ml-2 text-xs text-zinc-400">(Unavailable for Gmail domain)</span>
  )}
</h2>


              <ToggleSwitch
  isOn={privacy === "private"}
  disableAnimation={initialLoad}
  onToggle={handleToggleClick}
  disabled={isGmailUser}
/>

            </div>

            <p className="text-zinc-400 text-sm leading-relaxed">
              {isGmailUser && (
  <div className="mt-3 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
    Your account cannot be switched to <span className="font-semibold text-white">Private</span>.
    <br />
    Only college domain users can enable private mode.
  </div>
)}

              {privacy === "private"
                ? "Only students from your college domain will see your profile and appear in your recommendations."
                : "Your profile becomes visible to all the users."}
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
                <p>
                  Your profile is{" "}
                  <span className="font-semibold text-white">Public</span>.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="text-blue-400 text-xl">👀</div>
                <p>
                  You appear in wider recommendations when set to{" "}
                  <span className="font-semibold text-white">Public</span>.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="text-purple-400 text-xl">🔗</div>
                <p>
                  Some details are visible when your profile is{" "}
                  <span className="font-semibold text-white">Public</span>.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="text-yellow-400 text-xl">⚠️</div>
                <p>
                  You can switch between{" "}
                  <span className="font-semibold text-white">Public</span> and{" "}
                  <span className="font-semibold text-white">Private</span>{" "}
                  anytime.
                </p>
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
