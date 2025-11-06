"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MatchCard from "../components/MatchCard";

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api`;

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, 80+, 60-80, below60
  const navigate = useNavigate();

  // ===== FETCH MATCHES ON MOUNT =====
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user info
        const { data: meRes } = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        setMe(meRes.user);

        // Get all matches sorted by compatibility
        const { data: matchesRes } = await axios.get(
          `${API_URL}/compatibility/all-matches`,
          { withCredentials: true }
        );

        setMatches(matchesRes.matches || []);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching matches:", err);
        setError(err.response?.data?.error || "Failed to load matches");
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // ===== HANDLE MESSAGE CLICK =====
  const handleSendMessage = (match) => {
    navigate(`/chat/${match.userId}`);
  };

  // ===== HANDLE VIEW PROFILE CLICK =====
 // after: include the dashboard compatibility in navigation state
const handleViewProfile = (match) => {
  navigate(`/view-profile/${match.userId}`, {
    state: { compatibility: typeof match.compatibility === "number" ? Math.round(match.compatibility) : undefined },
  });
};


  // ===== FILTER MATCHES =====
  const getFilteredMatches = () => {
    switch (filter) {
      case "80+":
        return matches.filter((m) => m.compatibility >= 80);
      case "60-80":
        return matches.filter(
          (m) => m.compatibility >= 60 && m.compatibility < 80
        );
      case "below60":
        return matches.filter((m) => m.compatibility < 60);
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches();

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24 px-4 flex items-center justify-center">
        <div className="rounded-full h-16 w-16 border-4 border-pink-500 border-t-purple-600 animate-spin"></div>
        <p className="ml-4 text-gray-600 text-lg font-semibold">Loading your perfect matches...</p>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen pt-23 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Your Matches</h1>
          <p className="text-lg text-gray-600">
            Discover connections based on personality compatibility
          </p>
          {me && (
            <p className="text-sm text-gray-500 mt-2">👋 Welcome, {me.name}!</p>
          )}
        </div>

        {/* ===== FILTER BUTTONS ===== */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {[
            { label: "All Matches", value: "all" },
            { label: "🔥 80% + (Perfect)", value: "80+" },
            { label: "💚 60-80% (Great)", value: "60-80" },
            { label: "👍 Below 60% (Explore)", value: "below60" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                filter === btn.value
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              }`}
            >
              {btn.label}
              {btn.value !== "all" && (
                <span className="ml-2">
                  ({
                    matches.filter((m) => {
                      if (btn.value === "80+") return m.compatibility >= 80;
                      if (btn.value === "60-80")
                        return m.compatibility >= 60 && m.compatibility < 80;
                      if (btn.value === "below60") return m.compatibility < 60;
                      return true;
                    }).length
                  })
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== MATCHES GRID ===== */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.userId}>
                <MatchCard
                  match={match}
                  onMessage={handleSendMessage}
                  onViewProfile={handleViewProfile}
                />
              </div>
            ))}
          </div>
        ) : (
          // ===== EMPTY STATE =====
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or check back later!</p>
            <button
              onClick={() => setFilter("all")}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              View All Matches
            </button>
          </div>
        )}

        {/* ===== STATS ===== */}
        {matches.length > 0 && (
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Your Compatibility Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Perfect Matches */}
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-green-600">
                  {matches.filter((m) => m.compatibility >= 80).length}
                </div>
                <p className="text-gray-700 font-semibold">Perfect Matches</p>
                <p className="text-sm text-gray-600">80%+ compatibility</p>
              </div>

              {/* Great Matches */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-blue-600">
                  {matches.filter((m) => m.compatibility >= 60 && m.compatibility < 80).length}
                </div>
                <p className="text-gray-700 font-semibold">Great Matches</p>
                <p className="text-sm text-gray-600">60-80% compatibility</p>
              </div>

              {/* Average Compatibility */}
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-purple-600">
                  {matches.length > 0
                    ? Math.round(
                        matches.reduce((sum, m) => sum + m.compatibility, 0) /
                          matches.length
                      )
                    : 0}
                  %
                </div>
                <p className="text-gray-700 font-semibold">Avg Compatibility</p>
                <p className="text-sm text-gray-600">Across all matches</p>
              </div>

              {/* Total Matches */}
              <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-pink-600">
                  {matches.length}
                </div>
                <p className="text-gray-700 font-semibold">Total Matches</p>
                <p className="text-sm text-gray-600">People in your area</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
