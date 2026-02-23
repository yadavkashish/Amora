"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Flame,
  Sparkles,
  Award,
  CheckCircle,
  Maximize2,
  Camera,
  User,
  BookOpen,
  GraduationCap,
  MoreHorizontal,
  Loader,
  ExternalLink,
} from "lucide-react";
import CompareDialog from "./CompareDialog";
import ViewProfileOptionsModal from "../components/modals/ViewProfileOptionsModal";

const API_URL = import.meta.env.DEV ? "http://localhost:5000" : "";

/* ---------- UI HELPERS ---------- */
const Card = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

const Badge = ({
  icon: Icon,
  label,
  colorClass = "bg-gray-800 text-gray-300",
}) => (
  <span
    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${colorClass} border border-white/5`}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
  </span>
);

/* ---------- Global Dark Theme Overrides ---------- */
const GlobalStyles = () => (
  <style>{`
    body { background-color: #030712; color: #f3f4f6; }
    .bg-dark-card { background: rgba(17, 24, 39, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); }
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
  useEffect(() => setIndex(initialIndex || 0), [initialIndex, isOpen]);

  if (!isOpen || !images.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-6"
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
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-6 p-3 bg-white/10 rounded-full text-white"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % images.length);
            }}
            className="absolute right-6 p-3 bg-white/10 rounded-full text-white"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </motion.div>
  );
}

export default function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [report, setReport] = useState(null);
  const [myReport, setMyReport] = useState(null);
  const [compat, setCompat] = useState(location.state?.compatibility ?? null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [compareOpen, setCompareOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const allImages = useMemo(() => {
    const imgs = [];
    if (profile?.profilePic) imgs.push(profile.profilePic);
    if (profile?.morePics && Array.isArray(profile.morePics))
      imgs.push(...profile.morePics);
    return imgs;
  }, [profile]);

  useEffect(() => {
    async function fetchAll() {
      if (!userId) return;
      setLoading(true);
      const base = API_URL.replace(/\/$/, "");
      try {
        let myId = null;
        try {
          const meRes = await axios.get(`${base}/api/auth/me`, {
            withCredentials: true,
          });
          myId = meRes?.data?.user?._id || meRes?.data?._id || null;
        } catch (err) {}

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
          (async () => {
            try {
              return await axios.get(`${base}/api/auth/user/${userId}`, {
                withCredentials: true,
              });
            } catch {
              const all = await axios.get(`${base}/api/auth/all-users`, {
                withCredentials: true,
              });
              const found = (all.data.users || all.data).find(
                (u) => (u._id || u.id) === userId,
              );
              return { data: { user: found } };
            }
          })(),
        ]);

        if (pRes.status === "fulfilled") setProfile(pRes.value.data);
        if (rRes.status === "fulfilled")
          setReport(rRes.value.data.report || rRes.value.data);
        if (myRes.status === "fulfilled")
          setMyReport(myRes.value.data.report || myRes.value.data);
        if (userRes?.status === "fulfilled") {
          const data = userRes.value.data || {};
          setUserEmail(data.user?.email || data.email || null);
        }

        if (typeof compat !== "number" && myId) {
          try {
            const comp = await axios.get(
              `${base}/api/compatibility/match/${myId}/${userId}`,
              { withCredentials: true },
            );
            if (comp.data?.compatibility)
              setCompat(Math.round(comp.data.compatibility));
          } catch (err) {}
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }
    fetchAll();
  }, [userId]);

  const handleBlockUser = async () => {
    try {
      await axios.post(
        `${API_URL}/api/chat/${userId}/block`,
        {},
        { withCredentials: true },
      );
      alert("User blocked.");
      navigate("/explore");
    } catch (err) {
      alert("Failed to block.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader className="animate-spin text-violet-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-20 pt-24">
      <GlobalStyles />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-violet-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <Card className="relative overflow-visible mb-8">
          <div className="h-48 sm:h-64 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-900/40 to-blue-900/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
          </div>

          <div className="px-6 pb-6 sm:px-10 sm:pb-8 relative z-20 -mt-20 flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <div
                onClick={() =>
                  allImages.length && (setViewerIndex(0), setViewerOpen(true))
                }
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-gray-900 bg-gray-800 shadow-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={profile.profilePic}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-gray-900 rounded-full" />
            </div>

            <div className="flex-1 min-w-0 pt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-baseline gap-3">
                    {profile.name}{" "}
                    <span className="text-xl sm:text-2xl font-normal text-gray-500">
                      {profile.age}
                    </span>
                  </h1>
                  <div className="flex items-center gap-2 text-gray-400 mt-1">
                    <MapPin className="w-4 h-4 text-violet-400" />
                    <span>
                      {typeof profile.location === "string"
                        ? profile.location
                        : profile.location?.city || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOptions(true)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition"
                  >
                    <MoreHorizontal size={20} className="text-zinc-300" />
                  </button>
                  <button
                    onClick={() => setCompareOpen(true)}
                    disabled={!myReport}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4" /> Compare
                  </button>
                  {report && (
                    <button
                      onClick={() =>
                        window.open(`/personality-report/${userId}`, "_blank")
                      }
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> View Report
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {profile.gender && (
                  <Badge
                    icon={User}
                    label={profile.gender}
                    colorClass="bg-blue-500/10 text-blue-400 border-blue-500/20"
                  />
                )}
                {profile.preference && (
                  <Badge
                    icon={Heart}
                    label={profile.preference}
                    colorClass="bg-pink-500/10 text-pink-400 border-pink-500/20"
                  />
                )}
                {profile.course && (
                  <Badge icon={GraduationCap} label={profile.course} />
                )}
                {profile.branch && (
                  <Badge icon={BookOpen} label={profile.branch} />
                )}
              </div>
            </div>
          </div>
          {profile.bio && (
            <div className="px-6 pb-6 sm:px-10 sm:pb-8 border-t border-gray-800 pt-6">
              <p className="text-gray-300 leading-relaxed max-w-4xl">
                {profile.bio}
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-900 border-violet-500/20">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" /> Personality
                </h3>
                {typeof compat === "number" && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    {compat}% Match
                  </span>
                )}
              </div>
              <div className="mb-4">
                <p className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-1">
                  Type
                </p>
                <p className="text-gray-200 font-medium">
                  {report?.personalityProfile || "Analysis Pending"}
                </p>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {report?.detailedReport?.summary?.description ||
                  report?.personalityNarrative ||
                  "No core narrative available."}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Strengths
              </h3>
              <div className="space-y-3">
                {(
                  report?.strengths ||
                  report?.aiGeneratedReport?.strengths || [
                    "Kindness",
                    "Creativity",
                    "Focus",
                  ]
                )
                  .slice(0, 4)
                  .map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-300"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />{" "}
                      {s}
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-violet-400" /> Gallery
                </h3>
                <span className="text-xs text-gray-500">
                  {allImages.length} Photos
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-800 relative group cursor-pointer"
                    onClick={() => {
                      setViewerIndex(idx);
                      setViewerOpen(true);
                    }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewerOpen && (
          <FullscreenImageViewer
            images={allImages}
            initialIndex={viewerIndex}
            isOpen={viewerOpen}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </AnimatePresence>

      <ViewProfileOptionsModal
        open={showOptions}
        onClose={() => setShowOptions(false)}
        onBlock={handleBlockUser}
      />
      <CompareDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        meReport={myReport}
        otherReport={report}
        compatibilityScore={compat}
      />
    </div>
  );
}
