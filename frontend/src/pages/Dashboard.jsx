'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL; 
const API_URL = `${BASE_URL}/api`;

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);

        // 1. Get current user
        const { data: meRes } = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        setMe(meRes.user);

        // 2. Get all other profiles
        const { data: others } = await axios.get(`${API_URL}/profile/all-profiles`, {
          withCredentials: true,
        });

        // 3. Call compatibility API
        const results = await Promise.all(
          others.map(async (other) => {
            try {
              const { data } = await axios.get(
                `${API_URL}/compatibility/match/${meRes.user._id}/${other.user._id}`
              );
              return {
                ...other,
                compatibility: data.compatibility,
                interpretation: data.interpretation,
              };
            } catch (err) {
              console.error("❌ Match error:", err);
              return null;
            }
          })
        );

        // 4. Sort matches
        const validMatches = results
          .filter(r => r !== null)
          .sort((a, b) => b.compatibility - a.compatibility);

        setMatches(validMatches);
      } catch (err) {
        console.error("❌ Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleSendMessage = (match) => {
    navigate(`/chat/${match.user._id}`);
  };

  const handleViewProfile = (match) => {
    navigate(`/view-profile/${match.user._id}`);
  };

  if (loading) return <p>Loading matches...</p>;

  return (
    <div className="min-h-screen bg-pink-50 pt-24 px-4">
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 justify-items-center">
          {matches.map((match) => (
            <div
              key={match._id}
              className="w-56 bg-white shadow rounded-md overflow-hidden relative transition hover:scale-105 duration-300"
            >
              {/* Compatibility Badge */}
              <div className="absolute top-2 right-2 bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                {match.compatibility}% Match
              </div>

              {/* User Profile Picture */}
              <img
                src={`${BASE_URL}/uploads/${match.profilePic}`}
                alt={match.name}
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
                className="w-full h-32 object-cover rounded-t-md"
              />

              {/* Card Content */}
              <div className="p-2">
                <h2 className="text-base font-semibold text-pink-700">
                  {match.name}, {match.age}
                </h2>
                <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                  {match.bio}
                </p>

                <p className="text-[11px] italic text-gray-500 mb-2 line-clamp-2">
                  {match.interpretation}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendMessage(match)}
                    className="flex-1 bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 transition text-xs"
                  >
                    Msg
                  </button>
                  <button
                    onClick={() => handleViewProfile(match)}
                    className="flex-1 bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 transition text-xs"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No close matches found.</p>
      )}
    </div>
  );
}
