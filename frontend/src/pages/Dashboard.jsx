import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  AlertCircle,
  Flame,
  TrendingUp,
  Users,
  Sparkles,
  Filter,
  MapPin,
  Star,
  School,
  Zap,
  CheckCircle,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}` || "http://localhost:5000";

// ============================================================================
// HELPER: Normalize gender
// ============================================================================
function normalizeGender(g) {
  if (!g) return "";
  const s = String(g).trim().toLowerCase();
  if (s === "m" || s === "male") return "male";
  if (s === "f" || s === "female") return "female";
  if (s === "other") return "other";
  return s;
}

// ============================================================================
// LOADING SKELETON
// ============================================================================
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-14 w-80 mx-auto mb-4 rounded-2xl bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-96 mx-auto mb-6 rounded-xl bg-gray-200 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl shadow-lg overflow-hidden"
            >
              <div className="h-80 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-full rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="h-10 rounded-xl bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================
function ErrorState({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 pt-24 px-4 flex items-center justify-center"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md text-center border-2 border-red-200">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-6"
        >
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Oops!</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Try Again
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MATCH CARD - Beautiful light theme
// ============================================================================
function MatchCard({ match, idx, onViewProfile, onMessage }) {
  const [imageFailed, setImageFailed] = useState(false);

  const getCompatibilityColor = (score) => {
    if (score >= 80) return "from-emerald-500 via-green-500 to-teal-500";
    if (score >= 60) return "from-blue-500 via-cyan-500 to-sky-500";
    return "from-orange-500 via-amber-500 to-yellow-500";
  };

  const compScore = Math.round(Number(match.compatibility) || 0);
  const compColor = getCompatibilityColor(compScore);

  const getDomainName = (domain) => {
    if (!domain) return "";
    const name = domain.replace("@", "").split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.5 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -12, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)" }}
      className="h-full transform transition-shadow duration-500"
    >
      <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col group border border-gray-100">
        {/* Image Section */}
        <div className="relative h-80 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          {match.profilePic && !imageFailed ? (
            <img
              src={match.profilePic}
              alt={match.name}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
              <span className="text-white text-7xl font-black opacity-70">
                {match.name?.charAt(0) || "?"}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Compatibility Badge */}
          <div
            className={`absolute top-4 right-4 px-5 py-2.5 rounded-2xl font-black text-white shadow-xl flex items-center gap-2 bg-gradient-to-r ${compColor}`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-lg">{compScore}%</span>
          </div>

          {/* Domain Badge */}
          {match.emailDomain && (
            <div className="absolute top-4 left-4 px-4 py-2.5 rounded-2xl font-bold text-white shadow-xl flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              <School className="w-4 h-4" />
              <span className="text-sm">
                {getDomainName(match.emailDomain)}
              </span>
            </div>
          )}

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h3 className="text-3xl font-black mb-1 drop-shadow-lg">
              {match.name}, {match.age}
            </h3>
            {match.location && (
              <div className="flex items-center gap-2 text-sm font-semibold bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 inline-flex">
                <MapPin className="w-4 h-4" />
                {match.location}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 flex-grow flex flex-col">
          {/* Bio */}
          <p className="text-gray-700 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed font-medium italic">
            {match.bio || "No bio provided yet..."}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5 border-t border-gray-100 pt-4">
            {match.gender && (
              <span className="px-4 py-1.5 bg-gradient-to-r from-pink-100 to-rose-50 text-pink-700 rounded-full text-xs font-bold border-2 border-pink-200 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {match.gender}
              </span>
            )}
            {match.interests && match.interests.length > 0 && (
              <span className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-purple-50 text-blue-700 rounded-full text-xs font-bold border-2 border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {match.interests.length} Interests
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewProfile(match)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>View</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMessage(match)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 text-gray-700 font-black rounded-2xl shadow-md hover:bg-gray-200 transition-all border border-gray-200"
            >
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <span>Chat</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export default function DashboardModern() {
  const [me, setMe] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const abortRef = useRef(null);

 

  // ===== FETCH DATA =====
  useEffect(() => {
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const meRes = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
          signal,
        });
        setMe(meRes.data.user || null);

        const profileRes = await axios.get(`${API_URL}/api/profile/latest`, {
          withCredentials: true,
          signal,
        });
        setMyProfile(profileRes.data || null);

        const matchesRes = await axios.get(
          `${API_URL}/api/compatibility/all-matches`,
          {
            withCredentials: true,
            signal,
          }
        );

        const payload = matchesRes.data;
        const rawMatches = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.matches)
          ? payload.matches
          : payload?.data || [];

        const normalized = rawMatches.map((m) => ({
          ...m,
          compatibility: Number(m.compatibility ?? 0),
          gender: m.gender ?? "",
          emailDomain: m.emailDomain ?? "",
        }));

        setMatches(normalized);
        setLoading(false);
      } catch (err) {
        if (axios.isCancel?.(err) || err.name === "CanceledError") return;
        console.error("❌ Error fetching data:", err);
        setError(
          err.response?.data?.error || err.message || "Failed to load matches"
        );
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ===== APPLY FILTERS (Domain + Gender + Compatibility) =====
  useEffect(() => {
    if (!Array.isArray(matches) || !me) {
      setFilteredMatches([]);
      return;
    }

    let result = [...matches];

    // ✅ DOMAIN FILTERING (PRIMARY) - Only same email domain
    const userDomain = me.emailDomain;
    if (userDomain) {
      result = result.filter((m) => m.emailDomain === userDomain);
    }

    // 🔥 OPPOSITE GENDER FILTERING (SECONDARY)
    const userGender = normalizeGender(me.gender);
    if (userGender) {
      result = result.filter((m) => {
        const matchGender = normalizeGender(m.gender);
        if (!matchGender) return false;

        if (userGender === "male" && matchGender === "female") return true;
        if (userGender === "female" && matchGender === "male") return true;
        if (userGender === "other" && matchGender !== "other") return true;

        return false;
      });
    }

    // Secondary compatibility filtering
    switch (filter) {
      case "80+":
        result = result.filter((m) => Number(m.compatibility) >= 80);
        break;
      case "60-80":
        result = result.filter((m) => {
          const c = Number(m.compatibility);
          return c >= 60 && c < 80;
        });
        break;
      case "below60":
        result = result.filter((m) => Number(m.compatibility) < 60);
        break;
      default:
        break;
    }

    setFilteredMatches(result);
  }, [matches, me, filter]);

  // ===== HANDLERS =====
  const handleViewProfile = (match) => {
    console.log("📍 Navigating to profile:", match.userId);
    navigate(`/view-profile/${match.userId}`, {
      state: {
        compatibility: Math.round(Number(match.compatibility) || 0),
        matchName: match.name,
        matchGender: match.gender,
      },
    });
  };

  const handleSendMessage = (match) => {
    console.log("💬 Opening chat with:", match.userId);
    navigate(`/chat/${match.userId}`, { state: { matchName: match.name } });
  };

  // ===== STATS =====
  const stats = {
    perfect: filteredMatches.filter((m) => Number(m.compatibility) >= 80)
      .length,
    great: filteredMatches.filter((m) => {
      const c = Number(m.compatibility);
      return c >= 60 && c < 80;
    }).length,
    average:
      filteredMatches.length > 0
        ? Math.round(
            filteredMatches.reduce(
              (s, m) => s + Number(m.compatibility || 0),
              0
            ) / filteredMatches.length
          )
        : 0,
    total: filteredMatches.length,
  };

  // ===== RENDER =====
  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );

  const oppositeGender =
    normalizeGender(me?.gender) === "male"
      ? "Female"
      : normalizeGender(me?.gender) === "female"
      ? "Male"
      : "Other";

  const getDomainDisplay = (domain) => {
    if (!domain) return "";
    const name = domain.replace("@", "").split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-12 px-4 pt-24 relative overflow-hidden"
    >
      {/* Subtle animated background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.h1
  initial={{ opacity: 0, y: 18 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
  className="text-4xl md:text-6xl font-extrabold mb-5"
  style={{ lineHeight: 1.02 }}
>
  Find Your{" "}
  <span
    style={{
      background: "linear-gradient(90deg, #FF3CAC, #9B4DFF, #3A7BFF)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      display: "inline-block",
      fontWeight: 900,
    }}
  >
    Perfect Match
  </span>
</motion.h1>




          <p className="text-xl text-gray-600 mb-6 font-semibold flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span>Discover meaningful connections from your campus</span>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </p>

          <div className="inline-block px-4">
            <div className="px-8 py-4 bg-white rounded-3xl shadow-xl border-2 border-pink-100">
              <p className="text-base text-gray-700 font-semibold">
                <span className="mr-2">👋</span>
                Welcome,{" "}
                <span className="font-black text-transparent bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text">
                  {me?.name}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- Filter Buttons --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center mb-10 px-4"
        >
          {[
            { label: "All Matches", value: "all", icon: "🎯" },
            { label: "Perfect", value: "80+", icon: "🔥" },
            { label: "Great", value: "60-80", icon: "💚" },
            { label: "Explore", value: "below60", icon: "👍" },
          ].map((btn, idx) => (
            <motion.button
              key={btn.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(btn.value)}
              className={`px-7 py-3 rounded-full font-bold transition-all flex items-center gap-2 text-base ${
                filter === btn.value
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl shadow-purple-500/30"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200"
              }`}
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
              {btn.value !== "all" && (
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                    filter === btn.value ? "bg-white/30" : "bg-gray-100"
                  }`}
                >
                  {
                    filteredMatches.filter((m) =>
                      btn.value === "80+"
                        ? m.compatibility >= 80
                        : btn.value === "60-80"
                        ? m.compatibility >= 60 && m.compatibility < 80
                        : m.compatibility < 60
                    ).length
                  }
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* --- Filter Status Banner --- */}
        {/* <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-indigo-300 rounded-2xl p-6 mb-12 max-w-4xl mx-auto shadow-lg"
        >
          <div className="flex items-start gap-4">
            <Filter className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-indigo-900 text-lg font-bold mb-2">
                🎓 Campus Filtering Active
              </p>
              <div className="space-y-1 text-sm text-indigo-800">
                <p>
                  <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                  Showing only{" "}
                  <span className="font-bold">{oppositeGender}</span> profiles
                  based on your gender preference.
                </p>
                <p>
                  <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                  Profiles restricted to{" "}
                  <span className="font-bold">
                    {getDomainDisplay(me?.emailDomain)} College
                  </span>{" "}
                  ({me?.emailDomain}).
                </p>
                <p className="text-xs text-indigo-700 mt-2">
                  💡 This ensures you find matches exclusively within your verified community!
                </p>
              </div>
            </div>
          </div>
        </motion.div> */}

        {/* --- Matches Grid --- */}
        {filteredMatches.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16"
          >
            <AnimatePresence>
              {filteredMatches.map((match, idx) => (
                <MatchCard
                  key={match.userId}
                  match={match}
                  idx={idx}
                  onViewProfile={handleViewProfile}
                  onMessage={handleSendMessage}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white rounded-3xl shadow-xl border-2 border-gray-100"
          >
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              No Matches Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              No {oppositeGender.toLowerCase()} profiles available from{" "}
              <span className="font-bold">
                {getDomainDisplay(me?.emailDomain)}
              </span>{" "}
              with the current filter settings.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter("all")}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all text-lg"
            >
              View All Matches
            </motion.button>
          </motion.div>
        )}

        {/* --- Stats Section --- */}
        {filteredMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
          >
            <h3 className="text-4xl font-black text-gray-900 mb-10 flex items-center gap-4 tracking-tight">
              <TrendingUp className="w-10 h-10 text-pink-600" />
              Your Compatibility Scoreboard
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Perfect Matches */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Flame className="w-9 h-9 text-green-600" />
                  <span className="text-xs font-bold text-green-700 bg-white px-3 py-1 rounded-full">
                    PERFECT
                  </span>
                </div>
                <div className="text-6xl font-black text-green-600 mb-2">
                  {stats.perfect}
                </div>
                <p className="text-sm text-green-700 font-semibold">
                  80%+ Matches
                </p>
              </div>

              {/* Great Matches */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Sparkles className="w-9 h-9 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-full">
                    GREAT
                  </span>
                </div>
                <div className="text-6xl font-black text-blue-600 mb-2">
                  {stats.great}
                </div>
                <p className="text-sm text-blue-700 font-semibold">
                  60-80% Matches
                </p>
              </div>

              {/* Average */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-9 h-9 text-purple-600" />
                  <span className="text-xs font-bold text-purple-700 bg-white px-3 py-1 rounded-full">
                    AVERAGE
                  </span>
                </div>
                <div className="text-6xl font-black text-purple-600 mb-2">
                  {stats.average}%
                </div>
                <p className="text-sm text-purple-700 font-semibold">
                  Overall Compatibility
                </p>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-9 h-9 text-orange-600" />
                  <span className="text-xs font-bold text-orange-700 bg-white px-3 py-1 rounded-full">
                    TOTAL
                  </span>
                </div>
                <div className="text-6xl font-black text-orange-600 mb-2">
                  {stats.total}
                </div>
                <p className="text-sm text-orange-700 font-semibold">
                  From your campus
                </p>
              </div>
            </div>

            {/* Tip */}
            <div className="mt-8 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <p className="text-indigo-800 text-sm font-medium flex items-start gap-2">
                <Star className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600" />
                <span>
                  💡 <span className="font-bold">Pro Tip:</span> Update your
                  personality assessment to increase the accuracy of these
                  compatibility scores and attract higher quality matches!
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
