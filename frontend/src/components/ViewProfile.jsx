"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Lightbulb,
  MessageCircle,
  Target,
} from "lucide-react";
import CompareDialog from "./CompareDialog"; // adjust path if needed

/* ---------- Small UI helpers (unchanged UI) ---------- */
function LoadingIndicator({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-pink-600 font-semibold text-lg">
      {message || "Loading..."}
    </div>
  );
}

function ErrorMessage({ message, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <p className="text-red-600 font-medium">{message}</p>
      <button
        onClick={onBack}
        className="mt-4 px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
      >
        Go back
      </button>
    </div>
  );
}

function NoProfile() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      No profile found.
    </div>
  );
}

/* ---------- Profile card UI (same as yours) ---------- */
function ProfileCard({ profile, navigate, userId }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <img
        src={profile.profilePic || "/default-avatar.png"}
        alt={profile.name}
        className="w-32 h-32 rounded-full mb-3 object-cover border-2 border-pink-200 shadow"
      />
      <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h2>
      <div className="text-gray-600 text-sm mb-2">{profile.location}</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3 text-sm text-gray-700">
        <div>
          <span className="font-semibold">Age:</span> {profile.age ?? "—"}
        </div>
        <div>
          <span className="font-semibold">Gender:</span> {profile.gender ?? "—"}
        </div>
        <div>
          <span className="font-semibold">Interested In:</span>{" "}
          {profile.preference ?? "—"}
        </div>
        <div>
          <span className="font-semibold">Branch:</span> {profile.branch ?? "—"}
        </div>
        <div>
          <span className="font-semibold">Course:</span> {profile.course ?? "—"}
        </div>
        <div>
          <span className="font-semibold">Year:</span> {profile.year ?? "—"}
        </div>
        <div>
          <span className="font-semibold">Email:</span>{" "}
          {profile.user?.email ?? "—"}
        </div>
      </div>
      {profile.bio && (
        <div className="italic text-gray-500 text-sm mb-2">
          &ldquo;{profile.bio}&rdquo;
        </div>
      )}
      <div className="mb-3">
        <span className="font-semibold">Interests: </span>
        {profile.interests?.length ? (
          profile.interests.map((x, i) => (
            <span
              key={i}
              className="inline-block bg-pink-50 px-2 py-0.5 m-0.5 rounded text-pink-700 text-xs"
            >
              {x}
            </span>
          ))
        ) : (
          <span className="text-gray-400">Not provided</span>
        )}
      </div>
      <button
        onClick={() => navigate(`/chat/${profile.user?._id ?? userId}`)}
        className="mt-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
      >
        Message
      </button>
    </div>
  );
}

/* ---------- ReportPreview (kept minimal & same look) ---------- */
function ReportPreview({ userId, apiUrl }) {
  const [reportData, setReportData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [errorPreview, setErrorPreview] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoadingPreview(true);
      setErrorPreview(null);
      try {
        const res = await fetch(`${apiUrlFor(apiUrl)}/api/personality/${userId}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          setErrorPreview("No personality report available.");
          return;
        }

        const data = await res.json().catch(() => null);
        const serverReport = data?.report ?? data;
        if (!serverReport) {
          setErrorPreview("No personality report available.");
          return;
        }

        const normalized = {
          headline:
            serverReport?.detailedReport?.summary?.headline ??
            serverReport?.personalityProfile ??
            serverReport?.aiGeneratedReport?.personalityType?.name ??
            null,
          tagline:
            serverReport?.detailedReport?.summary?.tagline ??
            serverReport?.aiGeneratedReport?.personalityType?.description ??
            null,
          description:
            serverReport?.detailedReport?.summary?.description ??
            serverReport?.personalityNarrative ??
            serverReport?.aiGeneratedReport?.personalityNarrative ??
            null,
          strengths:
            serverReport?.detailedReport?.detailedInsights?.strengths ??
            serverReport?.aiGeneratedReport?.strengths ??
            [],
          developmentAreas:
            serverReport?.detailedReport?.detailedInsights?.developmentAreas ??
            serverReport?.aiGeneratedReport?.developmentAreas ??
            [],
          dateIdeas:
            serverReport?.detailedReport?.dateIdeas ??
            serverReport?.aiGeneratedReport?.dateIdeas ??
            [],
          conversationStarters:
            serverReport?.detailedReport?.conversationStarters ??
            serverReport?.aiGeneratedReport?.conversationStarters ??
            [],
          actionItems:
            serverReport?.detailedReport?.actionItems ??
            serverReport?.aiGeneratedReport?.actionItems ??
            [],
          enneagram:
            serverReport?.detailedReport?.enneagramAnalysis?.type ??
            serverReport?.enneagramType ??
            null,
          bigFive:
            serverReport?.scores ??
            serverReport?.bigFive ??
            serverReport?.aiGeneratedReport?.bigFive ??
            {},
        };

        if (!cancelled) setReportData(normalized);
      } catch (err) {
        console.error("ReportPreview API error:", err);
        if (!cancelled) setErrorPreview("Failed to fetch report preview.");
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    };

    load();
    return () => (cancelled = true);
  }, [userId, apiUrl]);

  if (loadingPreview)
    return (
      <div className="bg-white/90 border border-purple-100 rounded-2xl shadow-xl p-6 text-sm">
        Loading report preview…
      </div>
    );

  if (errorPreview)
    return (
      <div className="bg-white/90 border border-purple-100 rounded-2xl shadow-xl p-6 text-sm">
        <div className="text-gray-600 italic">{errorPreview}</div>
        <div className="mt-3">
          <a
            href={`/personality-report`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm hover:shadow-lg transition"
          >
            Open full report
          </a>
        </div>
      </div>
    );

  if (!reportData)
    return (
      <div className="bg-white/90 border border-purple-100 rounded-2xl shadow-xl p-6 text-sm">
        <div className="text-gray-600 italic">No personality report available.</div>
        <div className="mt-3">
          <a
            href={`/personality-report`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm hover:shadow-lg transition"
          >
            Open full report
          </a>
        </div>
      </div>
    );

  const {
    headline,
    tagline,
    description,
    strengths,
    developmentAreas,
    dateIdeas,
    conversationStarters,
    enneagram,
    bigFive,
  } = reportData;

  const hasBullets =
    (strengths && strengths.length) ||
    (developmentAreas && developmentAreas.length) ||
    (dateIdeas && dateIdeas.length) ||
    (conversationStarters && conversationStarters.length);

  return (
    <div className="bg-white/90 border border-purple-100 rounded-2xl shadow-xl p-6">
      <div>
        <h3 className="text-lg font-bold text-purple-700 mb-2">🧾 Personality Report</h3>

        {headline && <h4 className="text-xl font-semibold text-gray-800 mb-1">{headline}</h4>}
        {tagline && <div className="text-sm text-gray-600 italic mb-3">{tagline}</div>}

        {description ? (
          <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-line max-h-44 overflow-auto">{description}</p>
        ) : (
          <p className="text-gray-600 italic mb-3">Summary not available.</p>
        )}

        {hasBullets && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {strengths?.length > 0 && (
              <div>
                <div className="font-semibold text-green-800 mb-2">Strengths</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 max-h-36 overflow-auto">
                  {strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {developmentAreas?.length > 0 && (
              <div>
                <div className="font-semibold text-blue-800 mb-2">Growth Areas</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 max-h-36 overflow-auto">
                  {developmentAreas.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {dateIdeas?.length > 0 && (
              <div>
                <div className="font-semibold text-pink-800 mb-2">Date Ideas</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 max-h-36 overflow-auto">
                  {dateIdeas.map((di, i) => <li key={i}>{di.idea ? `${di.idea} — ${di.reason ?? ""}` : di}</li>)}
                </ul>
              </div>
            )}

            {conversationStarters?.length > 0 && (
              <div>
                <div className="font-semibold text-indigo-800 mb-2">Conversation Starters</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 max-h-36 overflow-auto">
                  {conversationStarters.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          {enneagram && <div className="mb-1">Enneagram: {enneagram}</div>}
          {bigFive && Object.keys(bigFive).length > 0 && (
            <div className="mb-1">Big Five: {Object.entries(bigFive).map(([k, v]) => `${k}: ${Math.round(v)}`).join(" · ")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helper to normalize API base ---------- */
function apiUrlFor(url) {
  return (url || "").replace(/\/$/, "") || "http://localhost:5000";
}

/* ---------- MAIN ViewProfile component ---------- */
export default function ViewProfile() {
  const { userId } = useParams(); // viewed user ID
  const navigate = useNavigate();
  const location = useLocation();

  // If Dashboard navigated here with state { compatibility }, prefer it
  const passedCompatibility = location?.state?.compatibility;
  const [compatibilityScore, setCompatibilityScore] = useState(
    typeof passedCompatibility === "number" ? Math.round(passedCompatibility) : undefined
  );

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [profile, setProfile] = useState(null);
  const [myPersonReport, setMyPersonReport] = useState(null);
  const [otherPersonReport, setOtherPersonReport] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile + reports + (fallback) compatibility
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const base = apiUrlFor(API_URL);

    const fetchAll = async () => {
      try {
        // 1) fetch current user (to use for compatibility API)
        let myId = null;
        try {
          const meRes = await axios.get(`${base}/api/auth/me`, { withCredentials: true });
          const meData = meRes?.data?.user ?? meRes?.data ?? null;
          myId = meData?.user?._id ?? meData?._id ?? null;
        } catch (err) {
          // non-fatal
          console.warn("Could not fetch current user (auth/me)", err);
        }

        // 2) fetch profile
        const profileRes = await fetch(`${base}/api/profile/user/${userId}`, { credentials: "include" });
        if (!profileRes.ok) {
          const text = await profileRes.text().catch(() => null);
          throw new Error(`Failed to load profile: ${profileRes.status} ${profileRes.statusText} ${text ?? ""}`);
        }
        const profileJson = await profileRes.json();
        setProfile(profileJson);

        // 3) fetch reports in parallel (best-effort)
        const [theirReportRes, myReportRes] = await Promise.allSettled([
          axios.get(`${base}/api/personality/${userId}`, { withCredentials: true }),
          axios.get(`${base}/api/personality/my-report`, { withCredentials: true }),
        ]);

        const theirServerReport = theirReportRes.status === "fulfilled" ? (theirReportRes.value?.data?.report ?? theirReportRes.value?.data ?? null) : null;
        const myServerReport = myReportRes.status === "fulfilled" ? (myReportRes.value?.data?.report ?? myReportRes.value?.data ?? null) : null;

        setOtherPersonReport(theirServerReport || null);
        setMyPersonReport(myServerReport || null);

        // 4) If dashboard didn't pass compatibility, attempt compatibility endpoint
        if (typeof passedCompatibility === "undefined") {
          try {
            // ensure we have an id to query with (myId), otherwise try to fetch again
            if (!myId) {
              try {
                const meAgain = await axios.get(`${base}/api/auth/me`, { withCredentials: true });
                const meAgainData = meAgain?.data?.user ?? meAgain?.data ?? null;
                myId = meAgainData?.user?._id ?? meAgainData?._id ?? null;
              } catch (e) {
                myId = null;
              }
            }

            if (myId) {
              const compRes = await axios.get(`${base}/api/compatibility/match/${myId}/${userId}`, { withCredentials: true });
              const compData = compRes?.data ?? null;
              const compVal =
                typeof compData?.compatibility === "number"
                  ? compData.compatibility
                  : typeof compData?.match?.compatibility === "number"
                  ? compData.match.compatibility
                  : undefined;

              if (typeof compVal === "number") {
                setCompatibilityScore(Math.round(compVal));
              } else if (Array.isArray(compData?.matches)) {
                const found = compData.matches.find((m) => String(m.userId) === String(userId) || String(m.userId) === String(profileJson?.user?._id));
                if (found?.compatibility != null) setCompatibilityScore(Math.round(found.compatibility));
              }
            }
          } catch (err) {
            console.warn("Compatibility endpoint not available or failed:", err);
            // fallback: leave compatibilityScore undefined (CompareDialog will compute)
          }
        } else {
          // passedCompatibility exists — ensure state is set (already done at init, but keep safe)
          setCompatibilityScore(Math.round(passedCompatibility));
        }
      } catch (err) {
        console.error("Error fetching profile or reports:", err);
        setError(err.message || "Failed to load profile. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, API_URL, passedCompatibility]);

  if (loading) return <LoadingIndicator message="Loading profile…" />;
  if (error) return <ErrorMessage message={error} onBack={() => navigate(-1)} />;
  if (!profile) return <NoProfile />;

  return (
    <section className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-6 pt-23">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileCard profile={profile} navigate={navigate} userId={userId} />
        <div className="space-y-4">
          <ReportPreview userId={userId} apiUrl={API_URL} />
          <div className="flex gap-3">
            <a
              href={`/personality-report/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition text-center"
            >
              Open full report
            </a>

            <button
              onClick={() => setCompareOpen(true)}
              disabled={!myPersonReport || !otherPersonReport}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                myPersonReport && otherPersonReport
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              title={
                myPersonReport && otherPersonReport
                  ? "Compare personality profiles"
                  : "Comparison unavailable until both users have reports"
              }
            >
              Compare
            </button>
          </div>
        </div>
      </div>

      <CompareDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        meReport={myPersonReport}
        otherReport={otherPersonReport}
        compatibilityScore={compatibilityScore}
      />
    </section>
  );
}
