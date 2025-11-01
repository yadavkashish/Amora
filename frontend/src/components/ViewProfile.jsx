"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompareDialog from "./CompareDialog";
import axios from "axios";
import { motion } from "framer-motion"; // optional for smooth fade-in

export default function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [profile, setProfile] = useState(null);
  const [otherPersonReport, setOtherPersonReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await fetch(
          `${API_URL}/api/profile/user/${userId}`,
          { credentials: "include" }
        );
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        try {
          const pr = await axios.get(`${API_URL}/api/personality/${userId}`, {
            withCredentials: true,
          });
          const report = pr.data.report ?? pr.data;
          setOtherPersonReport(report?.report ? report.report : report);
        } catch (err) {
          console.warn("No personality report found:", err?.response?.status);
          setOtherPersonReport(null);
        }
      } catch (err) {
        console.error("Failed to fetch profile page data:", err);
        setError("Failed to load profile. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId, API_URL]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-600 font-semibold text-lg">
        Loading profile…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Go back
        </button>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No profile found.
      </div>
    );

  return (
    <section className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-6 pt-23">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left: Profile Section (50%) */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 transition hover:shadow-xl">
          <div className="flex flex-col items-center text-center">
            <img
              src={profile.profilePic || "/default-avatar.png"}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover shadow-md border-2 border-pink-100"
            />
            <h2 className="text-2xl font-bold mt-4 text-gray-800">
              {profile.name}
            </h2>
            <p className="text-gray-500 text-sm">{profile.location}</p>

            {profile.bio && (
              <p className="mt-3 italic text-gray-700 max-w-md">
                “{profile.bio}”
              </p>
            )}

            {/* Basic Details */}
            <div className="mt-6 w-full">
              <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700">
                <div>
                  <span className="font-semibold text-gray-800">Age:</span>{" "}
                  {profile.age ?? "—"}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Gender:</span>{" "}
                  {profile.gender ?? "—"}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">
                    Interested In:
                  </span>{" "}
                  {profile.preference ?? "—"}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Course:</span>{" "}
                  {profile.course ?? "—"}
                </div>
              </div>

              {/* Email */}
              <div className="mt-4 text-sm text-gray-700">
                <span className="font-semibold text-gray-800">Email:</span>{" "}
                {profile.user?.email ?? "—"}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                className="px-5 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
                onClick={() => navigate(`/chat/${profile.user?._id ?? userId}`)}
              >
                💬 Message
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="mt-8 border-t pt-5">
            <h4 className="font-semibold mb-3 text-gray-800">Interests</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {profile.interests?.length > 0 ? (
                profile.interests.map((it, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm border border-pink-100"
                  >
                    {it}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  No interests listed
                </span>
              )}
            </div>
          </div>

          {/* Gallery */}
          {profile.morePics?.length > 0 && (
            <div className="mt-8 border-t pt-5">
              <h4 className="font-semibold mb-3 text-gray-800">Gallery</h4>
              <div className="grid grid-cols-3 gap-3">
                {profile.morePics.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt={`pic-${i}`}
                    className="h-24 w-full object-cover rounded-lg shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Right: Personality Report --- */}
        <aside className="bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition">
          <h3 className="text-2xl font-bold text-purple-700 mb-4">
            🧠 Personality Report
          </h3>

          {!otherPersonReport ? (
            <div className="text-sm text-gray-600 italic">
              No personality report available for this user.
            </div>
          ) : (
            <>
              <div className="mb-5">
                <p className="text-lg font-semibold text-purple-700">
                  {otherPersonReport.personalityType}
                </p>
                <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                  {otherPersonReport.summary}
                </p>
              </div>

              <div className="mb-5">
                <h5 className="text-sm font-semibold uppercase text-purple-600 tracking-wide">
                  Trait Scores
                </h5>
                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                  {Object.entries(otherPersonReport.traits || {}).map(
                    ([k, v]) => (
                      <li
                        key={k}
                        className="flex justify-between border-b border-gray-100 py-1"
                      >
                        <span className="capitalize">
                          {k.replace("_", " ")}
                        </span>
                        <span className="font-medium text-purple-700">
                          {v ?? "—"}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {otherPersonReport.strengths?.length > 0 && (
                <div className="mb-5">
                  <h5 className="text-sm font-semibold uppercase text-purple-600 tracking-wide">
                    Strengths
                  </h5>
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
                    {otherPersonReport.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {otherPersonReport.challenges?.length > 0 && (
                <div className="mb-5">
                  <h5 className="text-sm font-semibold uppercase text-purple-600 tracking-wide">
                    Challenges
                  </h5>
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
                    {otherPersonReport.challenges.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="w-full mt-4 px-5 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition"
                onClick={() => setCompareOpen(true)}
              >
                💞 Compare Personalities
              </button>
            </>
          )}
        </aside>
      </motion.div>

      <CompareDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        otherReport={otherPersonReport}
      />
    </section>
  );
}
