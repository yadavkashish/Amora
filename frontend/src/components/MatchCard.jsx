"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  MessageCircle,
  Sparkles,
  School,
  MapPin,
} from "lucide-react";
import { useState } from "react";

export default function MatchCard({
  match,
  onViewProfile,
  onMessage,
  onRequestChat,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  // ================= HELPERS =================

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

  // ================= CHAT BUTTON =================

  const renderChatButton = () => {
    switch (match.chatStatus) {
      case "NONE":
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRequestChat(match)}
            className="py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            💌 Request Chat
          </motion.button>
        );

      case "REQUESTED":
        return (
          <button
            disabled
            className="py-2.5 rounded-xl bg-white/10 text-zinc-400 text-sm font-semibold cursor-not-allowed"
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
            className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-black text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Chat
          </motion.button>
        );

      case "BLOCKED":
        return (
          <button
            disabled
            className="py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold cursor-not-allowed"
          >
            🚫 Blocked
          </button>
        );

      default:
        return null;
    }
  };

  // ================= RENDER =================

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group h-full"
    >
      <div className="relative h-full bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-pink-500/30 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-pink-500/10">

        {/* IMAGE */}
        <div className="relative h-72 overflow-hidden bg-zinc-900">
          {match.profilePic && !imageFailed ? (
            <img
              src={match.profilePic}
              alt={match.name}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <span className="text-zinc-700 text-6xl font-black">
                {match.name?.charAt(0) || "?"}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-transparent to-transparent" />

          {/* MATCH BADGE */}
          <div className="absolute top-4 right-4">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold text-black shadow-lg flex items-center gap-1.5 bg-gradient-to-r ${compGradient}`}
            >
              <Flame className="w-3.5 h-3.5" />
              {compScore}% Match
            </div>
          </div>

          {/* DOMAIN */}
          {match.emailDomain && (
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-400" />
                {getDomainName(match.emailDomain)}
              </div>
            </div>
          )}

          {/* NAME */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-2xl font-bold text-white">
              {match.name},{" "}
              <span className="text-pink-500 font-light">
                {match.age}
              </span>
            </h3>
            {match.location && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                {match.location}
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
            "{match.bio || "Just joined the community..."}"
          </p>

          {/* TAGS */}
          <div className="flex flex-wrap gap-2 mb-6">
            {match.gender && (
              <span className="px-2.5 py-1 rounded-md bg-white/5 text-[10px] uppercase text-zinc-400">
                {match.gender}
              </span>
            )}
            {match.interests?.length > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-white/5 text-[10px] uppercase text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                {match.interests.length} Interests
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewProfile(match)}
              className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" /> Profile
            </motion.button>

            {renderChatButton()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
