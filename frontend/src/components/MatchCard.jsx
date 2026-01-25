"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  MessageCircle,
  Sparkles,
  School,
  MapPin,
  Lock,
  Zap,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendChatRequest } from "../api/chatApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MatchCard({
  match,
  onViewProfile,
  onMessage,
  fetchMatches,
  isLocked,
}) {
  const navigate = useNavigate();

  const [modalStep, setModalStep] = useState(null); // null=closed, 0=options, 1=note input
  const [note, setNote] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  console.log("MATCH CHAT STATUS →", match.userId, match.chatStatus);


  // ======================================================
  // FIXED: Always resolves correct receiverId
  // ======================================================
  const getReceiverId = () => {
    return match.userId || match._id || match.user?._id;
  };

  // ======================================================
  // SEND CHAT REQUEST
  // ======================================================
  const handleChatRequest = async (noteText) => {
    const receiverId = match.userId || match._id || match.user?._id;

    if (!receiverId) {
      console.error("❌ No receiverId found:", match);
      return;
    }

    console.log("📤 Sending request:", {
      receiverId,
      note: noteText,
    });

    await sendChatRequest(receiverId, noteText);
    fetchMatches?.();
  };

  // ======================================================
  // STYLING HELPERS
  // ======================================================

  const getCompatibilityGradient = (score) => {
    if (score >= 80) return "from-emerald-400 to-green-600";
    if (score >= 60) return "from-blue-400 to-cyan-500";
    return "from-amber-400 to-orange-500";
  };

  const getDomainName = (domain) => {
    if (!domain) return "";
    const name = domain.replace("@", "").split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const compScore = Math.round(Number(match.compatibility) || 0);
  const compGradient = getCompatibilityGradient(compScore);

  // ======================================================
  // CHAT BUTTON LOGIC
  // ======================================================
  const renderChatButton = () => {
    if (isLocked) return null;

    switch (match.chatStatus) {
      case "NONE":
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalStep(0)}
            className="py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 
                       text-white text-sm font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            💌 Request Chat
          </motion.button>
        );

      case "REQUESTED":
        return (
          <button
            disabled
            className="py-2.5 rounded-xl bg-white/10 text-zinc-400 text-sm cursor-not-allowed"
          >
            ⏳ Pending
          </button>
        );

      case "ACCEPTED":
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMessage(match)}
            className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 
                       to-green-600 text-black text-sm font-semibold shadow-lg 
                       flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Chat
          </motion.button>
        );

      default:
        return null;
    }
  };

  // ======================================================
  // RENDER COMPONENT
  // ======================================================

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group h-full relative"
    >
      <div
        className={`relative h-full bg-black/40 backdrop-blur-md border border-white/10 
                    rounded-3xl overflow-hidden transition-all duration-500 flex flex-col
          ${
            isLocked
              ? "hover:border-white/10"
              : "hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/10"
          }`}
      >
        {/* LOCK PAYWALL */}
        {isLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/20 backdrop-blur-xl">
            <div className="p-4 rounded-full bg-pink-500/20 border border-pink-500/40 mb-4">
              <Lock className="w-8 h-8 text-pink-500" />
            </div>

            <h4 className="text-xl text-white font-bold mb-2">
              Potential Match Found!
            </h4>
            <p className="text-zinc-300 text-xs mb-6 px-4">
              Unlock premium to chat with this match.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/premium")}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r 
                         from-pink-500 via-purple-500 to-indigo-500 text-white 
                         text-xs font-bold shadow-lg flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Unlock Premium
            </motion.button>
          </div>
        )}

        {/* CARD CONTENT */}
        <div
          className={`${isLocked ? "blur-2xl grayscale pointer-events-none" : ""}`}
        >
          {/* IMAGE */}
          <div className="relative h-72 overflow-hidden">
            {match.profilePic && !imageFailed ? (
              <img
                src={match.profilePic}
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <span className="text-zinc-700 text-6xl font-black">
                  {match.name?.charAt(0)}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

            {/* MATCH BADGE */}
            <div className="absolute top-4 right-4">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold text-black bg-gradient-to-r ${compGradient} flex items-center gap-1.5 shadow-lg`}
              >
                <Flame className="w-3.5 h-3.5" />
                {compScore}% Match
              </div>
            </div>

            {/* DOMAIN */}
            {match.emailDomain && (
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-black/60 border border-white/10 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-400" />
                  {getDomainName(match.emailDomain)}
                </div>
              </div>
            )}

            {/* NAME + AGE */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-2xl font-bold text-white">
                {match.name},{" "}
                <span className="text-pink-500 font-light">{match.age}</span>
              </h3>
            </div>
          </div>

          {/* BODY */}
          <div className="p-5">
            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
              "{match.bio || "Just joined the community..."}"
            </p>

            {/* TAGS */}
            <div className="flex gap-2 mb-6">
              {match.gender && (
                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-zinc-400 uppercase">
                  {match.gender}
                </span>
              )}
              {match.interests?.length > 0 && (
                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-zinc-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {match.interests.length} Interests
                </span>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => onViewProfile(match)}
                className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold flex justify-center items-center gap-2"
              >
                <Heart className="w-4 h-4" /> Profile
              </motion.button>

              {renderChatButton()}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
         MODAL (Send With Note / Without Note)
         ====================================================== */}
      {modalStep !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#0d0b12] border border-white/10 p-6 rounded-2xl w-96">
            {/* STEP 0 */}
            {modalStep === 0 && (
              <>
                <h3 className="text-xl text-white font-bold mb-6">
                  Send Chat Request
                </h3>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setModalStep(1);
                    }}
                    className="py-3 bg-pink-600 text-white rounded-lg font-semibold"
                  >
                    Send with a Note
                  </button>

                  <button
                    onClick={() => {
                      handleChatRequest(null);
                      setModalStep(null);
                    }}
                    className="py-3 bg-white/10 text-zinc-300 rounded-lg"
                  >
                    Send without a Note
                  </button>

                  <button
                    onClick={() => setModalStep(null)}
                    className="py-3 bg-white/5 text-zinc-500 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* STEP 1 — NOTE INPUT */}
            {modalStep === 1 && (
              <>
                <h3 className="text-xl text-white font-bold mb-3">
                  Add a Note
                </h3>

                <textarea
                  value={note}
                  maxLength={200}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-32 bg-white/5 border border-white/10 
                             rounded-xl p-3 text-white outline-none"
                  placeholder="Write something sweet..."
                />

                <p className="text-xs text-zinc-500 text-right">
                  {note.length}/200
                </p>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={() => {
                      handleChatRequest(note);
                      setModalStep(null);
                    }}
                    className="py-3 bg-pink-600 text-white rounded-lg font-semibold"
                  >
                    Send
                  </button>

                  <button
                    onClick={() => setModalStep(0)}
                    className="py-3 bg-white/10 text-zinc-300 rounded-lg"
                  >
                    Back
                  </button>

                  <button
                    onClick={() => setModalStep(null)}
                    className="py-3 bg-white/5 text-zinc-500 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
