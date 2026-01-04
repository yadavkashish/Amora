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
  Search
} from "lucide-react";
import { sendChatRequest } from "../api/chat";
import MatchCard from "../components/MatchCard";


const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}` || "http://localhost:5000";

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
// MATCH CARD - Professional Dark Theme
// ============================================================================
// function MatchCard({ match, idx, onViewProfile, onMessage }) {
//   const [imageFailed, setImageFailed] = useState(false);

//   const getCompatibilityColor = (score) => {
//     if (score >= 80) return "from-emerald-400 to-green-600";
//     if (score >= 60) return "from-blue-400 to-cyan-500";
//     return "from-amber-400 to-orange-500";
//   };

//   const compScore = Math.round(Number(match.compatibility) || 0);
//   const compGradient = getCompatibilityColor(compScore);

//   const getDomainName = (domain) => {
//     if (!domain) return "";
//     const name = domain.replace("@", "").split(".")[0];
//     return name.charAt(0).toUpperCase() + name.slice(1);
//   };

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.9 }}
//       transition={{ delay: idx * 0.05, duration: 0.4 }}
//       className="group h-full"
//     >
//       <div className="relative h-full bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-pink-500/30 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-pink-500/10">
        
//         {/* Image Area */}
//         <div className="relative h-72 overflow-hidden bg-zinc-900">
//           {match.profilePic && !imageFailed ? (
//             <img
//               src={match.profilePic}
//               alt={match.name}
//               onError={() => setImageFailed(true)}
//               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
//             />
//           ) : (
//             <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
//               <span className="text-zinc-700 text-6xl font-black opacity-50">
//                 {match.name?.charAt(0) || "?"}
//               </span>
//             </div>
//           )}

//           <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-transparent to-transparent opacity-90" />

//           {/* Badges */}
//           <div className="absolute top-4 right-4">
//              <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-black shadow-lg flex items-center gap-1.5 bg-gradient-to-r ${compGradient}`}>
//               <Flame className="w-3.5 h-3.5 fill-black/20" />
//               <span>{compScore}% Match</span>
//             </div>
//           </div>

//           {match.emailDomain && (
//             <div className="absolute top-4 left-4">
//               <div className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
//                 <School className="w-3.5 h-3.5 text-blue-400" />
//                 <span>{getDomainName(match.emailDomain)}</span>
//               </div>
//             </div>
//           )}

//           {/* Overlay Info */}
//           <div className="absolute bottom-0 left-0 right-0 p-5">
//             <h3 className="text-2xl font-bold text-white mb-1 truncate">
//               {match.name}, <span className="text-pink-500 font-light">{match.age}</span>
//             </h3>
//             {match.location && (
//               <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
//                 <MapPin className="w-3.5 h-3.5" />
//                 {match.location}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Content Area */}
//         <div className="p-5 flex-grow flex flex-col">
//           <p className="text-zinc-400 text-sm line-clamp-2 mb-4 leading-relaxed font-light flex-grow">
//             "{match.bio || "Just joined the community..."}"
//           </p>

//           {/* Tags */}
//           <div className="flex flex-wrap gap-2 mb-6">
//             {match.gender && (
//               <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
//                 {match.gender}
//               </span>
//             )}
//             {match.interests?.length > 0 && (
//               <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1">
//                 <Sparkles className="w-3 h-3 text-purple-400" />
//                 {match.interests.length} Interests
//               </span>
//             )}
//           </div>

//           {/* Buttons */}
//           <div className="grid grid-cols-2 gap-3 mt-auto">
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => onViewProfile(match)}
//               className="py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
//             >
//               <Heart className="w-4 h-4" /> Profile
//             </motion.button>

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => onMessage(match)}
//               className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
//             >
//               <MessageCircle className="w-4 h-4 text-blue-400" /> Chat
//             </motion.button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

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

        const meRes = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true, signal });
        setMe(meRes.data.user || null);

        const matchesRes = await axios.get(`${API_URL}/api/compatibility/all-matches`, { withCredentials: true, signal });

        const payload = matchesRes.data;
        const rawMatches = Array.isArray(payload) ? payload : Array.isArray(payload?.matches) ? payload.matches : payload?.data || [];

        const normalized = rawMatches.map((m) => ({
  ...m,

  // existing fields you already rely on
  compatibility: Number(m.compatibility ?? 0),
  gender: m.gender ?? "",
  emailDomain: m.emailDomain ?? "",

  // new chat-request-related fields
  chatStatus: m.chatStatus || "NONE", // NONE | REQUESTED | ACCEPTED | BLOCKED
  chatId: m.chatId || null,
}));


        setMatches(normalized);
        setLoading(false);
      } catch (err) {
        if (axios.isCancel?.(err) || err.name === "CanceledError") return;
        console.error("❌ Error fetching data:", err);
        setError(err.response?.data?.error || err.message || "Failed to load matches");
        setLoading(false);
      }
    };

    fetchData();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  // ===== APPLY FILTERS =====
  useEffect(() => {
    if (!Array.isArray(matches) || !me) {
      setFilteredMatches([]);
      return;
    }

    let result = [...matches];

    // Domain Filter (Strict)
    if (me.emailDomain) {
      result = result.filter((m) => m.emailDomain === me.emailDomain);
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
      case "80+": result = result.filter((m) => Number(m.compatibility) >= 80); break;
      case "60-80": result = result.filter((m) => { const c = Number(m.compatibility); return c >= 60 && c < 80; }); break;
      case "below60": result = result.filter((m) => Number(m.compatibility) < 60); break;
      default: break;
    }

    setFilteredMatches(result);
  }, [matches, me, filter]);

 const handleRequestChat = async (match) => {
  try {
    await sendChatRequest(match.userId); // ✅ userId is correct
    
    setMatches(prev =>
      prev.map(m =>
        m.userId === match.userId
          ? { ...m, chatStatus: "REQUESTED" }
          : m
      )
    );
  } catch (err) {
    alert(err.response?.data?.error || "Failed to send request");
  }
};


  // ===== HANDLERS =====
  const handleViewProfile = (match) => {
    navigate(`/view-profile/${match.userId}`, {
      state: { compatibility: Math.round(Number(match.compatibility) || 0), matchName: match.name, matchGender: match.gender },
    });
  };

  const handleSendMessage = (match) => {
    navigate(`/chat/${match.userId}`, { state: { matchName: match.name } });
  };

  // ===== STATS =====
  const stats = {
    perfect: filteredMatches.filter((m) => Number(m.compatibility) >= 80).length,
    great: filteredMatches.filter((m) => { const c = Number(m.compatibility); return c >= 60 && c < 80; }).length,
    average: filteredMatches.length > 0 ? Math.round(filteredMatches.reduce((s, m) => s + Number(m.compatibility || 0), 0) / filteredMatches.length) : 0,
    total: filteredMatches.length,
  };

  // ===== RENDER =====
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;

  const oppositeGender = normalizeGender(me?.gender) === "male" ? "Female" : normalizeGender(me?.gender) === "female" ? "Male" : "Other";
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
            <span className="text-xs font-bold text-pink-300 tracking-wider uppercase">Welcome back, {me?.name}</span>
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

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 font-light"
          >
            Discover {oppositeGender.toLowerCase()} students from <span className="text-white font-semibold">{getDomainDisplay(me?.emailDomain)}</span> who match your vibe.
          </motion.p>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { label: "All Matches", value: "all", icon: Search },
              { label: "High Match (80%+)", value: "80+", icon: Flame, color: "text-emerald-400" },
              { label: "Great Match (60-80%)", value: "60-80", icon: Sparkles, color: "text-blue-400" },
              { label: "Exploratory", value: "below60", icon: Users, color: "text-amber-400" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`
                  relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border
                  ${filter === btn.value 
                    ? "bg-white/10 border-pink-500/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
                    : "bg-black/20 border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20"
                  }
                `}
              >
                <btn.icon className={`w-4 h-4 ${filter === btn.value ? btn.color || 'text-pink-400' : ''}`} />
                {btn.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Main Content Grid --- */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Matches Grid */}
        <AnimatePresence mode="wait">
          {filteredMatches.length > 0 ? (
            <motion.div 
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20"
            >
              {filteredMatches.map((match, idx) => (
  <MatchCard
    key={match.userId}
    match={match}
    idx={idx}
    isLocked={!me?.isPremium && match.isLocked}
    onViewProfile={handleViewProfile}
    onMessage={handleSendMessage}
    onRequestChat={handleRequestChat}
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
              <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
              <p className="text-zinc-500 max-w-md mx-auto mb-6">
                Try adjusting your filters or wait for more students from {getDomainDisplay(me?.emailDomain)} to join.
              </p>
              <button 
                onClick={() => setFilter("all")}
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
                { label: "Perfect Matches", value: stats.perfect, sub: "80%+ Score", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
                { label: "Great Matches", value: stats.great, sub: "60-80% Score", color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" },
                { label: "Avg Compatibility", value: `${stats.average}%`, sub: "Campus Average", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" },
                { label: "Total Students", value: stats.total, sub: "Filtered View", color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
              ].map((stat, i) => (
                <div key={i} className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm`}>
                  <p className="text-zinc-400 text-xs font-medium mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-white/20 text-[10px] uppercase tracking-wider">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
               <Star className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
               <p className="text-indigo-200 text-sm leading-relaxed">
                 <span className="font-bold text-white">Pro Tip:</span> Refine your personality assessment to improve the accuracy of the Vibe Check algorithm. Higher accuracy means better matches.
               </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}