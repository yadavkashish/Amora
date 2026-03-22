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
  MapPin,
  Star,
  School,
  Zap,
  Loader2,
  Search,
} from "lucide-react";
import { sendChatRequest } from "../api/chatApi";
import MatchCard from "../components/MatchCard";

const API_URL = import.meta.env.DEV ? "http://localhost:5000" : "";

// --- THEME BACKGROUND (Shared) ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 bg-[#05030a]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 0%, rgba(244, 63, 94, 0.15), transparent 50%),
          radial-gradient(circle at 90% 100%, rgba(168, 85, 247, 0.15), transparent 50%),
          radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.1), transparent 50%)
        `,
      }}
    />
    <div className="absolute inset-0 opacity-[0.2] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
  </div>
);

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
// LOADING SKELETON (Dark Mode)
// ============================================================================
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#05030a] pt-24 px-4 pb-12 relative overflow-hidden">
      <BackgroundGrid />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-12 w-64 mx-auto mb-4 rounded-xl bg-white/10 animate-pulse"></div>
          <div className="h-6 w-96 mx-auto mb-6 rounded-lg bg-white/5 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-[450px]"
            >
              <div className="h-64 bg-white/10 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 rounded-lg bg-white/10 animate-pulse"></div>
                <div className="h-4 w-full rounded-lg bg-white/5 animate-pulse"></div>
                <div className="h-10 rounded-xl bg-white/5 animate-pulse mt-4"></div>
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
    <div className="min-h-screen bg-[#05030a] pt-24 px-4 flex items-center justify-center relative">
      <BackgroundGrid />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/50 backdrop-blur-xl rounded-3xl p-10 max-w-md text-center border border-red-500/30 shadow-2xl"
      >
        <div className="mb-6 inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connection Issue</h2>
        <p className="text-zinc-400 mb-8">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all"
        >
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" /> Try Again
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}




// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export default function DashboardModern() {
  const [me, setMe] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  // nearby | same-city | all
  const navigate = useNavigate();
  const abortRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        axios.put(
          `${API_URL}/api/profile/update-location`,
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          { withCredentials: true },
        );
      },
      () => {
        // user denied location — ignore silently
      },
    );
  }, []);

  // ===== FETCH DATA =====
  useEffect(() => {
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [meRes, matchesRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/me`, {
            withCredentials: true,
            signal,
          }),
          axios.get(`${API_URL}/api/compatibility/all-matches`, {
            withCredentials: true,
            signal,
          }),
        ]);

        const user = meRes.data?.user;

        

        if (!user) throw new Error("User not found");
        if (user.deleted) {
          navigate("/account-deleted");
          return;
        }

        setMe(user);

        const payload = matchesRes.data;
        const rawMatches = Array.isArray(payload)
          ? payload
          : payload?.matches || payload?.data || [];

        const normalized = rawMatches
          .filter((m) => !m.isDeleted)
          .map((m) => ({
            ...m,
            compatibility: Number(m.compatibility ?? 0),
            chatStatus: m.chatStatus ?? "NONE",
          }));

        setMatches(normalized);
        setLoading(false);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load dashboard");
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ===== APPLY FILTERS =====
  useEffect(() => {
    if (!Array.isArray(matches) || !me) {
      setFilteredMatches([]);
      return;
    }

    let result = [...matches];

    if (locationFilter === "nearby") {
      result.sort(
        (a, b) =>
          (a.distance ?? Number.MAX_SAFE_INTEGER) -
          (b.distance ?? Number.MAX_SAFE_INTEGER),
      );
    }

    if (locationFilter === "same-city") {
      result = result.filter((m) => {
        const a =
          typeof m.location === "string" ? m.location : m.location?.city;

        const b =
          typeof me.location === "string" ? me.location : me.location?.city;

        return a?.toLowerCase?.() === b?.toLowerCase?.();
      });
    }

    // REAL PRIVACY FILTER (must match backend rules)
    if (me.privacy === "private") {
      // Private users → only same-domain
      // REAL PRIVACY FILTER (must match backend rules)
      result = result.filter((m) => {
        // 1️⃣ Same domain is always visible
        if (m.emailDomain === me.emailDomain) return true;

        // 2️⃣ Public profiles visible cross-domain
        if (m.privacy === "public") return true;

        // Otherwise blocked
        return false;
      });
    }

    // Gender Filter
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

    // Compatibility Filter
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
  }, [matches, me, filter, locationFilter]);

  // ===== HANDLERS =====
  const handleViewProfile = (match) => {
    navigate(`/view-profile/${match.userId}`, {
      state: {
        compatibility: Math.round(Number(match.compatibility) || 0),
        matchName: match.name,
        matchGender: match.gender,
      },
    });
  };

  const fetchMatchesData = async () => {
    const res = await axios.get(`${API_URL}/api/compatibility/all-matches`, {
      withCredentials: true,
    });

    const payload = res.data;
    const rawMatches = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.matches)
        ? payload.matches
        : payload?.data || [];

    const normalized = rawMatches
      .filter((m) => !m.isDeleted)
      .map((m) => ({
        ...m,
        compatibility: Number(m.compatibility ?? 0),
      }));

    setMatches(normalized);
  };

  const handleSendMessage = (match) => {
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
              0,
            ) / filteredMatches.length,
          )
        : 0,
    total: filteredMatches.length,
  };

  // ===== RENDER =====
  if (loading) return <LoadingSkeleton />;
  if (error) {
    console.warn("Ignoring dashboard error:", error);
  }

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
    <div className="min-h-screen bg-[#05030a] text-slate-200 font-sans pb-20 relative overflow-hidden">
      <BackgroundGrid />

      {/* --- Header Section --- */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center z-10 relative">
          {/* User Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 backdrop-blur-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-bold text-pink-300 tracking-wider uppercase">
              Welcome back, {me?.name}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6"
          >
            Your Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
              Connections.
            </span>
          </motion.h1>

          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 font-light"
          >
            Discover {oppositeGender.toLowerCase()} students from{" "}
            <span className="text-white font-semibold">
              {getDomainDisplay(me?.emailDomain)}
            </span>{" "}
            who match your vibe.
          </motion.p> */}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { label: "All Matches", value: "all", icon: Search },
              {
                label: "High Match (80%+)",
                value: "80+",
                icon: Flame,
                color: "text-emerald-400",
              },
              {
                label: "Great Match (60-80%)",
                value: "60-80",
                icon: Sparkles,
                color: "text-blue-400",
              },
              {
                label: "Exploratory",
                value: "below60",
                icon: Users,
                color: "text-amber-400",
              },
              {
                label: "Nearby",
                value: "nearby",
                icon: MapPin,
              },
              {
                label: "Same City",
                value: "same-city",
                icon: School,
              },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => {
                  if (btn.value === "nearby" || btn.value === "same-city") {
                    setLocationFilter(btn.value);
                  } else {
                    setFilter(btn.value);
                  }
                }}
                className={`
                  relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border
                  ${
                    (
                      btn.value === "nearby" || btn.value === "same-city"
                        ? locationFilter === btn.value
                        : filter === btn.value
                    )
                      ? "bg-white/10 border-pink-500/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                      : "bg-black/20 border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20"
                  }
                `}
              >
                <btn.icon
                  className={`w-4 h-4 ${
                    (
                      btn.value === "nearby" || btn.value === "same-city"
                        ? locationFilter === btn.value
                        : filter === btn.value
                    )
                      ? btn.color || "text-pink-400"
                      : ""
                  }`}
                />
                {btn.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Main Content Grid --- */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Matches Grid */}
        <AnimatePresence initial={false}>
          {filteredMatches.length > 0 ? (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20"
            >
              {filteredMatches.map((match, idx) => (
                <MatchCard
                  key={match.userId}
                  match={match}
                  onViewProfile={handleViewProfile}
                  onMessage={handleSendMessage}
                  fetchMatches={() => setMatches([...matches])}
                  isLocked={!me?.isPremium && match.isLocked}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center bg-black/30 border border-white/5 rounded-3xl"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No matches found
              </h3>
              <p className="text-zinc-500 max-w-md mx-auto mb-6">
                Try adjusting your filters or wait for more students from{" "}
                {getDomainDisplay(me?.emailDomain)} to join.
              </p>
              <button
                onClick={() => {
                  setFilter("all");
                  setLocationFilter("all");
                }}
                className="text-pink-400 text-sm hover:text-pink-300 font-medium underline underline-offset-4"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Stats HUD --- */}
        {filteredMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border-t border-white/10 pt-10"
          >
            <div className="flex items-center gap-2 mb-6 text-zinc-400 text-sm uppercase tracking-widest font-bold">
              <TrendingUp className="w-4 h-4 text-pink-500" /> Live Data
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Perfect Matches",
                  value: stats.perfect,
                  sub: "80%+ Score",
                  color: "text-emerald-400",
                  border: "border-emerald-500/20",
                  bg: "bg-emerald-500/5",
                },
                {
                  label: "Great Matches",
                  value: stats.great,
                  sub: "60-80% Score",
                  color: "text-blue-400",
                  border: "border-blue-500/20",
                  bg: "bg-blue-500/5",
                },
                {
                  label: "Avg Compatibility",
                  value: `${stats.average}%`,
                  sub: "Campus Average",
                  color: "text-purple-400",
                  border: "border-purple-500/20",
                  bg: "bg-purple-500/5",
                },
                {
                  label: "Total Students",
                  value: stats.total,
                  sub: "Filtered View",
                  color: "text-orange-400",
                  border: "border-orange-500/20",
                  bg: "bg-orange-500/5",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm`}
                >
                  <p className="text-zinc-400 text-xs font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </p>
                  <p className="text-white/20 text-[10px] uppercase tracking-wider">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Star className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-indigo-200 text-sm leading-relaxed">
                <span className="font-bold text-white">Pro Tip:</span> Refine
                your personality assessment to improve the accuracy of the Vibe
                Check algorithm. Higher accuracy means better matches.
              </p>
            </div> */}
          </motion.div>
        )}
      </div>
    </div>
  );
}
