'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

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

        // 2. Get all other profiles (already excludes logged in)
        const { data: others } = await axios.get(`${API_URL}/profile/all-profiles`, {
          withCredentials: true,
        });

        // 3. Call compatibility API for each other user
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

        // 4. Keep valid matches sorted by compatibility
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
    <div className="min-h-screen bg-pink-50 p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">Your Closest Matches</h1>

      {matches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match._id}
              className="bg-white shadow-lg rounded-xl overflow-hidden relative transition hover:scale-105 duration-300"
            >
              {/* Compatibility Badge */}
              <div className="absolute top-3 right-3 bg-pink-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
                {match.compatibility}% Match
              </div>

              {/* User Profile Picture */}
              <img
                src={`http://localhost:5000/uploads/${match.profilePic}`}
                alt={match.name}
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
                className="w-full h-56 object-cover rounded-t-lg"
              />

              {/* Card Content */}
              <div className="p-4">
                <h2 className="text-xl font-semibold text-pink-700">
                  {match.name}, {match.age}
                </h2>
                <p className="text-gray-600 mb-2">{match.bio}</p>

                <p className="text-sm italic text-gray-500 mb-3">
                  {match.interpretation}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendMessage(match)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => handleViewProfile(match)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    View Profile
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
