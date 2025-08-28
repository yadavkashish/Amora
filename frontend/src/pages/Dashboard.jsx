'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function traitValue(traitStrOrNum) {
  if (traitStrOrNum == null) return 5;

  const num = Number(traitStrOrNum);
  if (!isNaN(num)) return Math.min(Math.max(num, 1), 10);

  const value = String(traitStrOrNum).trim().toLowerCase();
  if (value === 'high') return 8;
  if (value === 'medium') return 5;
  if (value === 'low') return 2;

  return 5;
}

function compatibilityScore(traitA, traitB) {
  const maxDifference = 9;
  const diff = Math.abs(traitA - traitB);
  const score = ((maxDifference - diff) / maxDifference) * 100;
  return Math.round(score);
}

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMatches() {
      try {
        const meRes = await fetch('http://localhost:5000/api/form/my-response', {
          credentials: 'include',
        });
        const myForm = await meRes.json();

        const res = await fetch('http://localhost:5000/api/form/all-with-profiles', {
          credentials: 'include',
        });
        const others = await res.json();

        const traits = ['patience', 'communication', 'humor', 'ambition', 'adaptability'];

        let enriched = others.map((user) => {
          const profile = user.profile || {};
          const profileUserId =
            typeof profile.user === 'object' && profile.user !== null
              ? profile.user._id?.toString()
              : profile.user?.toString();

          let totalScore = 0;

          traits.forEach((trait) => {
            totalScore += compatibilityScore(
              traitValue(myForm[trait]),
              traitValue(user.formResponse ? user.formResponse[trait] : null)
            );
          });

          const finalScore = Math.round(totalScore / traits.length);

          return {
            ...profile,
            userId: profileUserId,
            compatibility: finalScore,
          };
        });

        const maxScore = enriched.length > 0 ? Math.max(...enriched.map((m) => m.compatibility)) : 0;
        const threshold = 5;
        enriched = enriched.filter((m) => m.compatibility >= maxScore - threshold);
        enriched.sort((a, b) => b.compatibility - a.compatibility);

        setMatches(enriched);
      } catch (err) {
        console.error('Error fetching matches:', err);
      }
    }

    fetchMatches();
  }, []);

  const handleSendMessage = (profile) => {
    navigate(`/chat/${profile.userId}`);
  };

  const handleViewProfile = (profile) => {
    navigate(`/view-profile/${profile.userId}`); // 👈 navigate to ViewProfile page
  };

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
              <div className="absolute top-3 right-3 bg-pink-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
                {match.compatibility}% Match
              </div>
              <img
                src={`http://localhost:5000/uploads/${match.profilePic}`}
                alt="Profile"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
                className="w-full h-56 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-pink-700">
                  {match.name}, {match.age}
                </h2>
                <p className="text-gray-600 mb-2">{match.bio}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendMessage(match)}
                    className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
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
