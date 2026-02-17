// ViewProfile.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Camera,
  Sparkles,
  Star,
  Shield,
  Flame,
  X,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader,
  MoreHorizontal,
} from "lucide-react";
import CompareDialog from "./CompareDialog";
import ViewProfileOptionsModal from "../components/modals/ViewProfileOptionsModal";

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";


/* ---------- Inline styles (no external css) ---------- */
const GlobalStyles = () => (
  <style>{`
    :root{
      --page-bg: linear-gradient(180deg,#fffafc,#fbfbff);
      --card-bg: #ffffff;
      --muted:#6b7280;
      --fg:#081124;
      --primary-1:#7c3aed;
      --accent:#ff3cac;
      --cyan:#06b6d4;
      --border: rgba(2,6,23,0.06);
      --shadow-elegant: 0 12px 40px rgba(2,6,23,0.06);
    }
    body{background:var(--page-bg); color:var(--fg); font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial;}
    .rounded-3xl{border-radius:1rem;}
    .rounded-2xl{border-radius:.75rem;}
    .shadow-elegant{box-shadow:var(--shadow-elegant);}
    .bg-card{background:var(--card-bg);}
    .text-muted{color:var(--muted);}
    .border-soft{border:1px solid var(--border);}
    .btn-soft{background:#fff;border:1px solid var(--border);padding:.55rem .9rem;border-radius:.75rem;display:inline-flex;align-items:center;gap:.5rem;}
    .btn-primary-grad{background:linear-gradient(90deg,#7c3aed,#06b6d4);color:#fff;padding:.55rem 1rem;border-radius:.75rem;border:none;font-weight:700;}
    .btn-accent-grad{background:linear-gradient(90deg,#ff3cac,#7c3aed);color:#fff;padding:.55rem 1rem;border-radius:.75rem;border:none;font-weight:700;}
    .compat-badge{border-radius:999px;padding:.45rem .9rem;display:inline-flex;align-items:center;gap:.4rem;color:#fff;font-weight:700;box-shadow:0 6px 20px rgba(124,58,237,0.12);}

    /* DECREASED cover height */
    .cover-h{height:7.5rem;}
    @media(min-width:768px){.cover-h{height:8.5rem;}}
    @media(min-width:1200px){.cover-h{height:9.5rem;}}

    .cover-gradient{background:linear-gradient(90deg,var(--primary-1),var(--accent) 60%,var(--cyan));background-size:200% 200%;opacity:0.98;}

    /* avatar overlap styling - moved up so half the avatar sits on the cover */
    .avatar-wrap{position:relative; margin-top:-5.5rem; display:flex; justify-content:flex-start; align-items:flex-start;}
    @media(min-width:768px){ .avatar-wrap{ margin-top:-6.5rem; } }
    .avatar-circle{width:96px;height:96px;border-radius:999px;border:6px solid #fff;box-shadow:0 18px 40px rgba(2,6,23,0.08);object-fit:cover;cursor:pointer;}
    @media(min-width:768px){.avatar-circle{width:120px;height:120px;border-width:8px;}}

    /* left card increased height */
    .profile-card-min{min-height:26.5rem;}

    /* set equal min height for both columns so they align */
    .col-equal { min-height: 28rem; }

    /* photos */
    .photo-h{height:11rem;}
    @media(min-width:768px){.photo-h{height:12rem;}}

    .gallery-item{transition:transform .25s ease,box-shadow .25s ease;}
    .gallery-item:hover{transform:translateY(-4px);box-shadow:0 10px 30px rgba(2,6,23,0.08);}

    .muted-box{background:#fafafa;border-radius:.5rem;padding:.75rem;border:1px solid var(--border);color:var(--muted);}

    /* personality snapshot box in left card */
    .personality-snap { background: linear-gradient(180deg,#fff,#fbfbff); border: 1px solid var(--border); padding: .75rem; border-radius: 12px; display:flex; flex-direction:column; gap:.5rem; }
    .snap-title { font-weight:700; color: #333; }
    .tag { padding: .25rem .5rem; border-radius:999px; background: #f3f4f6; font-size: .85rem; color: var(--muted); display:inline-flex; align-items:center; gap:.35rem; }

    /* responsive grid fallback */
    @media(max-width:1024px){
      .lg\\:grid-cols-\\[420px_1fr\\] { grid-template-columns: 420px 1fr; }
    }
  `}</style>
);

/* ---------- Fullscreen viewer ---------- */
function FullscreenImageViewer({
  images = [],
  initialIndex = 0,
  isOpen,
  onClose,
}) {
  const [index, setIndex] = useState(initialIndex || 0);

  React.useEffect(() => setIndex(initialIndex || 0), [initialIndex, isOpen]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !images.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white"
        onClick={onClose}
      >
        <X />
      </button>
      <div
        className="max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          src={images[index]}
          alt={`photo-${index}`}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          className="max-w-full max-h-full object-contain rounded"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % images.length);
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white"
          >
            <ChevronRight />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 bg-black/40 px-3 py-1 rounded-full">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ---------- Photo grid ---------- */
function PhotoGrid({ images = [], onPhotoClick, onAddFiles, isEditing }) {
  return (
    <div className="bg-card rounded-2xl shadow-elegant p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">📸 Photos ({images.length})</h3>
      </div>

      {!images.length ? (
        <div className="w-full h-44 bg-gray-50 rounded-md flex items-center justify-center text-muted">
          No photos yet
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((src, i) => (
            <motion.div
              key={i}
              onClick={() => onPhotoClick && onPhotoClick(i)}
              className="relative rounded-lg overflow-hidden gallery-item photo-h cursor-pointer"
            >
              <img
                src={src}
                alt={`photo-${i}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Main ViewProfile ---------- */
export default function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // <-- email from User model
  const [report, setReport] = useState(null);
  const [myReport, setMyReport] = useState(null);
  const [compat, setCompat] = useState(location.state?.compatibility ?? null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // gather images: profilePic first then morePics
  const allImages = [];
  if (profile?.profilePic) allImages.push(profile.profilePic);
  if (profile?.morePics && Array.isArray(profile.morePics))
    allImages.push(...profile.morePics);

  useEffect(() => {
    async function fetchAll() {
      if (!userId) return;
      setLoading(true);
      setError(null);
      const base = API_URL.replace(/\/$/, "");
      try {
        let myId = null;
        try {
          const meRes = await axios.get(`${base}/api/auth/me`, {
            withCredentials: true,
          });
          myId = meRes?.data?.user?._id || meRes?.data?._id || null;
        } catch (err) {
          /* ignore */
        }

        // fetch profile, personality, my-report, and user (for email)
        const [pRes, rRes, myRes, userRes] = await Promise.allSettled([
          axios.get(`${base}/api/profile/user/${userId}`, {
            withCredentials: true,
          }),
          axios.get(`${base}/api/personality/${userId}`, {
            withCredentials: true,
          }),
          axios.get(`${base}/api/personality/my-report`, {
            withCredentials: true,
          }),
          // ----- Fetch User model for this user (email) -----
          // Try direct per-user endpoint, otherwise fallback to all-users
          (async () => {
            try {
              return await axios.get(`${base}/api/auth/user/${userId}`, {
                withCredentials: true,
              });
            } catch (err) {
              // Fallback to all-users
              try {
                const all = await axios.get(`${base}/api/auth/all-users`, {
                  withCredentials: true,
                });
                const users = Array.isArray(all.data)
                  ? all.data
                  : all.data.users || all.data?.data || [];
                const found = users.find(
                  (u) =>
                    u._id === userId || u.id === userId || u._id === userId + ""
                );
                return { data: { user: found } };
              } catch (err2) {
                throw err2;
              }
            }
          })(),
        ]);

        if (pRes.status === "fulfilled") setProfile(pRes.value.data);
        else
          throw new Error(
            pRes.reason?.response?.data?.error || "Failed to fetch profile"
          );

        if (rRes.status === "fulfilled")
          setReport(rRes.value.data.report || rRes.value.data);
        if (myRes.status === "fulfilled")
          setMyReport(myRes.value.data.report || myRes.value.data);

        // handle userRes for email (safe access for different response shapes)
        if (userRes && userRes.status === "fulfilled") {
          const data = userRes.value.data || {};
          const email =
            data.user?.email || data.email || data.user?.data?.email || null;
          if (email) setUserEmail(email);
          else {
            // try to find email in other shapes
            if (data?.user === undefined && typeof data === "object") {
              if (data.email) setUserEmail(data.email);
              else if (
                data.user &&
                data.user._id &&
                data.user._id === userId &&
                data.user.email
              ) {
                setUserEmail(data.user.email);
              }
            } else if (
              data.user &&
              data.user._id &&
              data.user._id === userId &&
              data.user.email
            ) {
              setUserEmail(data.user.email);
            }
          }
        }

        if (typeof compat !== "number" && myId) {
          try {
            const comp = await axios.get(
              `${base}/api/compatibility/match/${myId}/${userId}`,
              { withCredentials: true }
            );
            if (comp.data?.compatibility)
              setCompat(Math.round(comp.data.compatibility));
          } catch (err) {
            /* ignore */
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch");
        setLoading(false);
      }
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const uploadProfileUpdate = async ({
    formFields = {},
    profileFile,
    moreFiles = [],
  }) => {
    const base = API_URL.replace(/\/$/, "");
    const fd = new FormData();
    Object.entries(formFields).forEach(([k, v]) => {
      if (v == null) return;
      if (Array.isArray(v)) v.forEach((item) => fd.append(`${k}[]`, item));
      else fd.append(k, v);
    });

    if (profileFile) fd.append("profilePic", profileFile);
    if (moreFiles.length) moreFiles.forEach((f) => fd.append("morePics", f));

    const res = await fetch(`${base}/api/profile/${profile._id}`, {
      method: "PUT",
      credentials: "include",
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Upload failed");
    }
    const updated = await res.json();
    return updated;
  };

  const handleBlockUser = async () => {
    try {
      const base = API_URL.replace(/\/$/, "");

      await axios.post(
        `${base}/api/chat/${userId}/block`,
        {},
        { withCredentials: true }
      );

      alert("User has been blocked.");
      setShowOptions(false);

      // Optional: Redirect back to home
      navigate("/explore");
    } catch (err) {
      console.error(err);
      alert("Failed to block user.");
    }
  };

  const handleAddFiles = async (fileList) => {
    if (!profile) return;
    const files = Array.from(fileList || []);
    if (!files.length) return;

    try {
      setSaving(true);
      const updated = await uploadProfileUpdate({
        formFields: {},
        profileFile: null,
        moreFiles: files,
      });
      setProfile(updated);
    } catch (err) {
      console.error("Photo upload error:", err);
      alert("Photo upload failed: " + (err.message || "unknown"));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenViewer = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleSaveFromModal = async (form) => {
    if (!profile) return;
    setSaving(true);
    try {
      const profileFile = form._profileFile || null;
      const moreFiles = form._moreFiles || [];
      const fields = {
        name: form.name,
        age: form.age,
        bio: form.bio,
        location: form.location,
        branch: form.branch,
        course: form.course,
        year: form.year,
      };
      const updated = await uploadProfileUpdate({
        formFields: fields,
        profileFile,
        moreFiles,
      });
      setProfile(updated);
      setEditOpen(false);
    } catch (err) {
      console.error("Save profile failed:", err);
      alert("Failed to save profile: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen px-4 py-16">
          <div className="max-w-6xl mx-auto animate-pulse space-y-6">
            <div className="h-20 bg-gray-200 rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-white rounded-3xl shadow-elegant" />
              <div className="h-96 bg-white rounded-3xl shadow-elegant" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen px-4 py-24 flex items-center justify-center">
          <div className="max-w-md bg-card rounded-2xl p-8 shadow-elegant text-center">
            <Shield className="w-14 h-14 mx-auto mb-4 text-pink-500" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted mb-6">{error || "Profile not found"}</p>
            <button
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8 pt-10">
          {/* Top cover (reduced height) */}
          <div className="bg-card rounded-3xl overflow-hidden shadow-elegant relative">
            <div
              className={`cover-h cover-gradient`}
              style={
                profile.coverImage
                  ? {
                      backgroundImage: `url(${profile.coverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            ></div>

            {/* content area overlapping the cover */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-stretch">
                {/* LEFT profile card (taller) */}
                <div
                  className="bg-card rounded-2xl p-6 shadow-elegant profile-card-min col-equal"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "32px", // slightly more internal padding
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="avatar-wrap"
                    style={{ marginBottom: "22px" }} // increased from 18 -> 22
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={profile.profilePic || ""}
                        alt="avatar"
                        className="avatar-circle"
                        onClick={() => allImages.length && handleOpenViewer(0)}
                        style={{ cursor: "pointer" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: 12,
                          top: window.innerWidth >= 768 ? 28 : 22,
                        }}
                        className="w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div
                    className="flex flex-col h-full"
                    style={{
                      gap: "4px", // added vertical gap between direct children
                      rowGap: "12px",
                    }}
                  >
                    <h2 className="text-2xl font-extrabold mb-1 text-center">
                      {profile.name || "—"}
                    </h2>

                    <div
                      className="text-center text-muted"
                      style={{ marginBottom: "6px" }}
                    >
                      {profile.age ? `${profile.age} years` : null}
                    </div>
                    <button
                      onClick={() => setShowOptions(true)}
                      className="p-2 hover:bg-white/10 rounded-full"
                    >
                      <MoreHorizontal size={22} className="text-zinc-300" />
                    </button>

                    <ViewProfileOptionsModal
                      open={showOptions}
                      onClose={() => setShowOptions(false)}
                      onBlock={handleBlockUser}
                    />

                    {/* --- EMAIL (from User model) --- */}
                    <h2 className="text-xl font-extrabold mb-1 text-center">
                      {userEmail || profile.email || "—"}
                    </h2>

                    {profile.location && (
                      <div
                        className="flex items-center justify-center text-muted"
                        style={{ marginBottom: "10px" }}
                      >
                        <MapPin className="w-4 h-4 text-pink-500 mr-2" />
                        <span>{profile.location}</span>
                      </div>
                    )}

                    {profile.bio && (
                      <div
                        className="text-sm"
                        style={{
                          background: "#fafafa",
                          padding: "12px 14px", // increased padding
                          borderRadius: "12px",
                          marginBottom: "18px", // slightly larger gap after bio
                          textAlign: "center",
                        }}
                      >
                        {profile.bio}
                      </div>
                    )}

                    <div
                      className="flex flex-wrap gap-3 justify-center"
                      style={{ marginBottom: "14px" }}
                    >
                      {profile.gender && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                          👤 {profile.gender}
                        </span>
                      )}
                      {profile.preference && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          💕 {profile.preference}
                        </span>
                      )}
                      {report?.personalityProfile && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          🧠 {report.personalityProfile}
                        </span>
                      )}
                      {profile.branch && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          {profile.branch}
                        </span>
                      )}
                      {profile.year && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Year {profile.year}
                        </span>
                      )}
                    </div>

                    {/* TOP INTERESTS SECTION (styled & spaced) - increased padding/gap */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #fff7fb, #fef4ff)",
                        borderRadius: "14px",
                        padding: "18px", // increased
                        marginTop: "6px",
                        marginBottom: "12px", // increased gap below interests
                        border: "1px solid rgba(255, 182, 226, 0.25)",
                      }}
                    >
                      <h4
                        className="text-sm font-semibold text-center"
                        style={{ color: "#d63384", marginBottom: "12px" }} // slightly bigger title gap
                      >
                        💖 Top Interests
                      </h4>

                      <div className="flex flex-wrap gap-3 justify-center">
                        {(profile.interests || [])
                          .slice(0, 6)
                          .map((it, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: "#fff",
                                padding: "8px 14px", // a touch larger pill
                                borderRadius: "18px",
                                fontSize: "13px",
                                color: "#8a5c7a",
                                fontWeight: 500,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                border: "1px solid rgba(214,51,132,0.15)",
                              }}
                            >
                              {it}
                            </span>
                          )) || <span className="text-muted">—</span>}
                      </div>
                    </div>

                    {/* Personality Snapshot pulled slightly up (reduced gap) */}
                    <div
                      className="personality-snap"
                      style={{
                        background: "linear-gradient(135deg, #f1e7ff, #fdecff)",
                        borderRadius: "14px",
                        padding: "14px 18px", // a bit more padding
                        marginTop: "14px", // moved slightly below interests (controlled)
                      }}
                    >
                      <div
                        className="snap-title font-semibold"
                        style={{ fontSize: "15px", marginBottom: "8px" }} // small bump in spacing
                      >
                        🌟 Personality Snapshot
                      </div>

                      <div
                        className="text-sm text-muted mb-2"
                        style={{ lineHeight: "1.4" }}
                      >
                        {report?.detailedReport?.summary?.headline ||
                          report?.aiGeneratedReport?.personalityType?.name ||
                          report?.personalityProfile ||
                          "No snapshot available."}
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {(() => {
                          const strengths =
                            report?.strengths ||
                            report?.aiGeneratedReport?.strengths ||
                            [];
                          const bigFive =
                            report?.scores || report?.bigFive || {};

                          if (strengths.length) {
                            return strengths.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                style={{
                                  padding: "5px 10px", // slightly larger tags
                                  background: "white",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  border: "1px solid rgba(0,0,0,0.07)",
                                }}
                              >
                                {s}
                              </span>
                            ));
                          } else {
                            const pairs = Object.entries(bigFive || {}).map(
                              ([k, v]) => [k, v || 0]
                            );
                            pairs.sort((a, b) => b[1] - a[1]);
                            return pairs.slice(0, 2).map((p, i) => (
                              <span
                                key={i}
                                style={{
                                  padding: "5px 10px",
                                  background: "white",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  border: "1px solid rgba(0,0,0,0.07)",
                                }}
                              >
                                {p[0]}: {Math.round(p[1])}
                              </span>
                            ));
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT personality card */}
                <div className="bg-card rounded-2xl p-6 shadow-elegant col-equal ">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-6 h-6 text-purple-600" />
                    <h3 className="text-3xl font-bold">Personality Analysis</h3>
                  </div>
                  <p className="text-muted mb-4 italic">
                    ✨{" "}
                    {report?.detailedReport?.summary?.headline ||
                      report?.personalityProfile ||
                      "Personality Profile"}
                  </p>

                  {report ? (
                    <div className="space-y-4 h-full flex flex-col">
                      <div>
                        <h4 className="font-semibold text-[19px] mb-2">
                          Core Narrative
                        </h4>
                        <p className="text-muted text-sm text-[15px]">
                          {report?.detailedReport?.summary?.description ||
                            report?.personalityNarrative ||
                            report?.summary ||
                            "No description available."}
                        </p>
                      </div>

                      {(report.scores ||
                        report.bigFive ||
                        report.aiGeneratedReport?.bigFive) && (
                        <div>
                          <h4 className="font-semibold mb- text-[19px]">
                            Big Five Traits
                          </h4>
                          <div className="grid grid-cols-1 gap-3 text-[18px]">
                            {[
                              [
                                "Extroversion",
                                report?.scores?.extraversion ||
                                  report?.bigFive?.extraversion ||
                                  report?.bigFive?.extroversion ||
                                  0,
                              ],
                              [
                                "Openness",
                                report?.scores?.openness ||
                                  report?.bigFive?.openness ||
                                  0,
                              ],
                              [
                                "Agreeableness",
                                report?.scores?.agreeableness ||
                                  report?.bigFive?.agreeableness ||
                                  0,
                              ],
                              [
                                "Conscientiousness",
                                report?.scores?.conscientiousness ||
                                  report?.bigFive?.conscientiousness ||
                                  0,
                              ],
                              [
                                "Emotional Stability",
                                100 -
                                  (report?.scores?.neuroticism ||
                                    report?.bigFive?.neuroticism ||
                                    0),
                              ],
                            ].map(([label, val], i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                              >
                                <div className="text-sm text-muted">
                                  {label}
                                </div>
                                <div className="font-semibold">
                                  {Math.round(val || 0)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t mt-2">
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <h4 className="font-semibold">
                              Relationship Style
                            </h4>
                            <div className="text-muted text-sm">
                              {report?.relationshipStyle || "Not specified."}
                            </div>
                          </div>

                          <div>
                            {typeof compat === "number" && (
                              <div
                                className="compat-badge"
                                style={{
                                  background:
                                    "linear-gradient(90deg,#10b981,#06b6d4)",
                                }}
                              >
                                <Flame className="w-4 h-4" />{" "}
                                <span style={{ marginLeft: 6 }}>{compat}%</span>
                                <div
                                  style={{
                                    marginLeft: 8,
                                    fontSize: 12,
                                    opacity: 0.95,
                                  }}
                                >
                                  Match
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* action buttons */}
                      <div className="mt-4 flex gap-3">
                        <button
                          className="btn-primary-grad"
                          onClick={() =>
                            window.open(
                              `/personality-report/${userId}`,
                              "_blank"
                            )
                          }
                        >
                          View Full Report
                        </button>
                        <button
                          className="btn-accent-grad"
                          onClick={() => setCompareOpen(true)}
                          disabled={!myReport}
                        >
                          Compare Profiles
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted">
                      No personality report available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <section>
            <h3 className="text-xl font-bold mb-4">📸 Photos</h3>
            <PhotoGrid
              images={allImages}
              onPhotoClick={(i) => handleOpenViewer(i)}
              onAddFiles={handleAddFiles}
              isEditing={true}
            />
          </section>

          {/* bottom summary / snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-elegant">
              <h3 className="text-lg font-bold mb-3">Profile Summary</h3>
              <div className="space-y-3">
                <div>
                  <strong>Interests:</strong>{" "}
                  {profile.interests?.join(", ") || "—"}
                </div>
                <div>
                  <strong>Course:</strong> {profile.course || "—"}
                </div>
                <div>
                  <strong>Branch:</strong> {profile.branch || "—"}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-elegant">
              <h3 className="text-lg font-bold mb-3">Personality Snapshot</h3>
              {report ? (
                <div>
                  <div className="mb-2 font-semibold">
                    {report?.aiGeneratedReport?.personalityType?.name ||
                      report?.personalityProfile ||
                      "—"}
                  </div>
                  <div className="text-muted text-sm">
                    {report?.aiGeneratedReport?.personalityNarrative ||
                      report?.summary ||
                      "—"}
                  </div>
                </div>
              ) : (
                <div className="text-muted">No report</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FullscreenImageViewer
        images={allImages}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
      {editOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setEditOpen(false)}
        >
          <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            className="w-full sm:max-w-2xl bg-card rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)}>
                <X />
              </button>
            </div>
            <EditForm
              profile={profile}
              onSave={handleSaveFromModal}
              onClose={() => setEditOpen(false)}
              saving={saving}
            />
          </motion.div>
        </motion.div>
      )}

      <CompareDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        meReport={myReport}
        otherReport={report}
        compatibilityScore={compat}
      />
    </>
  );
}

/* ---------- Small inline Edit form used by modal above ---------- */
function EditForm({ profile = {}, onSave, onClose, saving = false }) {
  const [form, setForm] = useState(profile || {});
  useEffect(() => setForm(profile || {}), [profile]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          className="w-full p-3 border border-soft rounded"
        />
        <input
          value={form.age || ""}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          placeholder="Age"
          className="w-full p-3 border border-soft rounded"
        />
      </div>

      <textarea
        rows={4}
        value={form.bio || ""}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        className="w-full p-3 border border-soft rounded"
        placeholder="Bio"
      />

      <div className="flex items-center gap-2">
        <label className="btn-soft cursor-pointer">
          Upload profile pic
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, _profileFile: e.target.files?.[0] })
            }
            className="hidden"
          />
        </label>
        <label className="btn-soft cursor-pointer">
          Upload more photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setForm({ ...form, _moreFiles: Array.from(e.target.files || []) })
            }
            className="hidden"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary-grad">
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save"
          )}
        </button>
        <button type="button" onClick={onClose} className="btn-soft">
          Cancel
        </button>
      </div>
    </form>
  );
}
