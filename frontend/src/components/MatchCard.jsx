"use client";

import { motion } from "framer-motion";

export default function MatchCard({ match, onMessage, onViewProfile }) {
  // Helper: Get color based on compatibility score
  const getCompatibilityColor = (score) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 65) return 'bg-yellow-500';
    if (score >= 55) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Helper: Get emoji based on compatibility
  const getCompatibilityEmoji = (score) => {
    if (score >= 85) return '🔥';
    if (score >= 75) return '💚';
    if (score >= 65) return '👍';
    if (score >= 55) return '🤔';
    return '❓';
  };

  // Helper: Get text color for compatibility
  const getTextColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-yellow-600';
    if (score >= 55) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="w-full max-w-sm bg-white shadow-lg rounded-2xl overflow-hidden relative transition duration-300 cursor-pointer"
    >
      {/* ===== COMPATIBILITY BADGE ===== */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`absolute top-3 right-3 ${getCompatibilityColor(match.compatibility)} text-white px-3 py-2 rounded-full shadow-lg z-10`}
      >
        <div className="text-center">
          <div className="text-lg font-bold">{match.compatibility}%</div>
          <div className="text-xs font-semibold">{match.category}</div>
          <div className="text-xl mt-1">{getCompatibilityEmoji(match.compatibility)}</div>
        </div>
      </motion.div>

      {/* ===== PROFILE PICTURE ===== */}
      <motion.div
        className="relative w-full h-44 bg-gray-200 overflow-hidden"
      >
        <img
          src={match.profilePic || '/default-avatar.png'}
          alt={match.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </motion.div>

      {/* ===== CARD CONTENT ===== */}
      <div className="p-4">
        {/* Name and Age */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-gray-800 mb-1"
        >
          {match.name}, {match.age}
        </motion.h3>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-gray-600 mb-2 line-clamp-2 h-10"
        >
          {match.bio || 'No bio provided'}
        </motion.p>

        {/* Compatibility Interpretation */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-xs italic mb-3 line-clamp-2 ${getTextColor(match.compatibility)}`}
        >
          💭 "{match.interpretation}"
        </motion.p>

        {/* Strengths/Alignment */}
        {match.strengths && match.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-3 p-2 bg-green-50 rounded border border-green-200"
          >
            <p className="text-xs font-semibold text-green-800 mb-1">✨ You align on:</p>
            <ul className="text-xs text-green-700 space-y-1">
              {match.strengths.slice(0, 2).map((strength, idx) => (
                <li key={idx}>• {strength}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMessage(match)}
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg transition font-semibold text-sm shadow-md"
          >
            💬 Chat
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewProfile(match)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-lg transition font-semibold text-sm shadow-md"
          >
            👁️ View
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}