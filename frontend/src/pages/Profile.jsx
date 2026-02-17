"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Edit3,
  Camera,
  Flame,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Award,
  Compass,
  Loader,
  Plus,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  User,
  BookOpen,
  Briefcase,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserProfileOptionsModal from "../components/modals/UserProfileOptionsModal";

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";


// --- UI HELPERS ---
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

// ============================================================================
// LOADING SKELETON
// ============================================================================
function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-64 bg-gray-800 rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="h-40 bg-gray-800 rounded-2xl" />
          <div className="h-40 bg-gray-800 rounded-2xl" />
        </div>
        <div className="lg:col-span-2 h-96 bg-gray-800 rounded-2xl" />
      </div>
    </div>
  );
}

const handleBlockUser = async () => {
  await axios.post(`/api/block/${userId}`, {}, { withCredentials: true });
  alert("User Blocked");
};

// ============================================================================
// FULLSCREEN VIEWER
// ============================================================================
const FullscreenImageViewer = ({ images, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    setCurrentIndex(initialIndex || 0);
  }, [initialIndex, isOpen]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          src={images[currentIndex]}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1 rounded-full text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
};

// ============================================================================
// PROFILE HEADER
// ============================================================================
const ProfileHeader = ({
  profile,
  onEditClick,
  onAddPhotos,
  onCoverSelect,
  openViewer,
  showProfileMenu,
  setShowProfileMenu,
  handleDeleteAccount,
  handleLogout,
}) => {
  const coverInputRef = useRef(null);
  const fileInputRef = useRef(null);
  // --- Profile More Options (three dots) ---

  if (!profile) return null;

  return (
    <Card className="relative overflow-visible mb-8">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 w-full relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 to-blue-900/30 z-0" />

        {/* Cover Upload Trigger */}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all border border-white/10"
        >
          <Camera className="w-5 h-5" />
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && onCoverSelect?.(e.target.files[0])
          }
        />
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 sm:px-10 sm:pb-8 relative z-20 -mt-20 flex flex-col md:flex-row items-start md:items-end gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div
            onClick={() => openViewer?.(0)}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-gray-900 bg-gray-800 shadow-2xl overflow-hidden cursor-pointer relative z-20"
          >
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt={profile.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-800">
                {profile.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-gray-900 rounded-full z-30" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-baseline gap-3">
                {profile.name}
                <span className="text-xl sm:text-2xl font-normal text-gray-500">
                  {profile.age}
                </span>
              </h1>
              <button
                onClick={() => setShowProfileMenu(true)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <MoreHorizontal size={22} className="text-zinc-300" />
              </button>

              <div className="flex items-center gap-2 text-gray-400 mt-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{profile.location || "Location not set"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                onClick={onEditClick}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium border border-gray-700 transition flex items-center gap-2 text-sm"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium shadow-lg shadow-violet-500/20 transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Photos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => onAddPhotos?.(e.target.files)}
              />
            </div>
          </div>

          {/* Tags */}
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
              <Badge icon={Briefcase} label={profile.branch} />
            )}
            {profile.year && (
              <Badge icon={BookOpen} label={`Year ${profile.year}`} />
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="px-6 pb-6 sm:px-10 sm:pb-8 border-t border-gray-800 pt-6">
          <p className="text-gray-300 leading-relaxed max-w-4xl">
            {profile.bio}
          </p>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// STATS GRID
// ============================================================================
const StatsSection = ({ stats }) => {
  const items = [
    {
      label: "Perfect Matches",
      value: stats?.perfectMatches || 0,
      icon: Flame,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Great Matches",
      value: stats?.greatMatches || 0,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Total Matches",
      value: stats?.totalMatches || 0,
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Compatibility",
      value: `${stats?.avgCompatibility || 0}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, idx) => (
        <Card
          key={idx}
          className="p-5 flex items-center gap-4 hover:border-gray-700 transition-colors"
        >
          <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
            <item.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              {item.label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ============================================================================
// PHOTO GRID (Masonry style look)
// ============================================================================
const PhotoGrid = ({ images, onPhotoClick }) => {
  if (!images || images.length === 0) return null;

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-violet-400" /> Gallery
        </h3>
        <span className="text-xs text-gray-500">{images.length} Photos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            className="aspect-square rounded-lg overflow-hidden bg-gray-800 relative group cursor-pointer"
            onClick={() => onPhotoClick(idx)}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        ))}
        {/* Placeholder for empty slots styling */}
        {[...Array(Math.max(0, 6 - images.length))].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-lg bg-gray-800/30 border border-gray-800/50"
          />
        ))}
      </div>
    </Card>
  );
};

// ============================================================================
// INSIGHTS & STRENGTHS
// ============================================================================
const InsightsSection = ({ report, navigate }) => {
  if (!report) {
    return (
      <Card className="p-8 text-center border-dashed border-gray-700 h-full flex flex-col items-center justify-center">
        <Sparkles className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Unlock Insights
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Take the personality quiz to see analysis.
        </p>
        <button
          onClick={() => navigate("/personality-report")}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium"
        >
          Start Quiz
        </button>
      </Card>
    );
  }

  const { aiGeneratedReport } = report;
  const personalityType =
    aiGeneratedReport?.personalityType?.name ||
    report.personalityProfile ||
    "Unknown";

  return (
    <div className="space-y-6 h-full">
      {/* Main Personality Card */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-900 border-violet-500/20">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" /> Personality
          </h3>
          <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-bold">
            {personalityType}
          </span>
        </div>

        {aiGeneratedReport?.personalityNarrative && (
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {aiGeneratedReport.personalityNarrative.slice(0, 200)}...
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Love Language</div>
            <div className="text-sm text-gray-200 font-medium truncate">
              {aiGeneratedReport?.relationshipApproach || "N/A"}
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Conflict Style</div>
            <div className="text-sm text-gray-200 font-medium truncate">
              {aiGeneratedReport?.conflictResolutionStyle || "Balanced"}
            </div>
          </div>
        </div>
      </Card>

      {/* Strengths List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" /> Key Traits
        </h3>
        <div className="space-y-3">
          {(aiGeneratedReport?.strengths || []).slice(0, 3).map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm text-gray-300"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {s}
            </div>
          ))}
          {(aiGeneratedReport?.developmentAreas || [])
            .slice(0, 2)
            .map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-gray-300"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {s}
              </div>
            ))}
        </div>
        <button
          onClick={() => navigate("/personality-report")}
          className="w-full mt-6 py-2 text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition"
        >
          View Full Report
        </button>
      </Card>
    </div>
  );
};

// ============================================================================
// EDIT MODAL (Dark Theme)
// ============================================================================
const EditProfileModal = ({ profile, isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState(profile || {});

  useEffect(() => {
    setFormData(profile || {});
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, [], []);
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition";
  const labelClass =
    "block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                value={formData.age || ""}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              rows={4}
              value={formData.bio || ""}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Interests (comma separated)</label>
            <input
              type="text"
              value={
                Array.isArray(formData.interests)
                  ? formData.interests.join(", ")
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interests: e.target.value
                    .split(",")
                    .map((i) => i.trim())
                    .filter((i) => i),
                })
              }
              className={inputClass}
            />
          </div>
        </form>

        <div className="p-6 border-t border-gray-800 bg-gray-900/50">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader className="animate-spin w-5 h-5" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
function ModernProfilePage() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const navigate = useNavigate();
  // --- Profile Options (three dots) ---
const [showProfileMenu, setShowProfileMenu] = useState(false);

const handleDeleteAccount = async () => {
  if (!window.confirm("Are you sure you want to delete your account?")) return;

  try {
    await fetch(`${BASE_URL}/api/auth/delete-account`, {
      method: "DELETE",
      credentials: "include",
    });
    alert("Account deleted");
    navigate("/login");
  } catch (err) {
    alert("Failed to delete your account.");
  }
};

const handleLogout = async () => {
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  } catch (err) {
    alert("Logout failed.");
  }
};


  const BASE_URL = API_URL.replace(/\/$/, "");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, reportRes, matchesRes] = await Promise.all([
        fetch(`${BASE_URL}/api/profile/latest`, { credentials: "include" }),
        fetch(`${BASE_URL}/api/personality/my-report`, {
          credentials: "include",
        }),
        fetch(`${BASE_URL}/api/compatibility/all-matches`, {
          credentials: "include",
        }).catch(() => null),
      ]);

      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      setProfile(await profileRes.json());

      if (reportRes.ok) {
        const data = await reportRes.json();
        setReport(data?.report || null);
      }

      if (matchesRes && matchesRes.ok) {
        const matchesData = await matchesRes.json();
        const matches = matchesData?.matches || [];
        const avg = matches.length
          ? Math.round(
              matches.reduce((s, m) => s + m.compatibility, 0) / matches.length
            )
          : 0;
        setStats({
          perfectMatches: matches.filter((m) => m.compatibility >= 80).length,
          greatMatches: matches.filter(
            (m) => m.compatibility >= 60 && m.compatibility < 80
          ).length,
          avgCompatibility: avg,
          totalMatches: matches.length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (updatedFields, newFiles) => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      Object.keys(updatedFields).forEach((key) => {
        if (key === "interests" && Array.isArray(updatedFields[key])) {
          updatedFields[key].forEach((i) => fd.append("interests[]", i));
        } else {
          fd.append(key, updatedFields[key]);
        }
      });
      if (newFiles)
        Array.from(newFiles).forEach((f) => fd.append("morePics", f));

      const res = await fetch(`${BASE_URL}/api/profile/${profile._id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      await fetchData();
      setIsEditing(false);
    } catch (e) {
      alert("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (files) => {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("morePics", f));
    await fetch(`${BASE_URL}/api/profile/${profile._id}/photos`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    fetchData();
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("coverImage", file);
    await fetch(`${BASE_URL}/api/profile/${profile._id}/cover`, {
      method: "PUT",
      body: fd,
      credentials: "include",
    });
    fetchData();
  };

  const allImages = profile
    ? [profile.profilePic, ...(profile.morePics || [])].filter(Boolean)
    : [];

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-950 pt-24">
        <LoadingSkeleton />
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        No Profile Found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-20 pt-24">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-violet-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <ProfileHeader
          profile={profile}
          onEditClick={() => setIsEditing(true)}
          onAddPhotos={handlePhotoUpload}
          onCoverSelect={handleCoverUpload}
          openViewer={(idx) => {
            setViewerIndex(idx);
            setViewerOpen(true);
          }}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          handleDeleteAccount={handleDeleteAccount}
          handleLogout={handleLogout}
        />
        <UserProfileOptionsModal
          open={showProfileMenu}
          onClose={() => setShowProfileMenu(false)}
          onDelete={handleDeleteAccount}
          onLogout={handleLogout}
        />

        <StatsSection stats={stats} />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personality & Strengths */}
          <div className="lg:col-span-1 h-full">
            <InsightsSection report={report} navigate={navigate} />
          </div>

          {/* Right Column: Gallery (Takes up more space) */}
          <div className="lg:col-span-2 h-full">
            <PhotoGrid
              images={allImages}
              onPhotoClick={(idx) => {
                setViewerIndex(idx);
                setViewerOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        <FullscreenImageViewer
          images={allImages}
          initialIndex={viewerIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </AnimatePresence>

      {isEditing && (
        <EditProfileModal
          profile={profile}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}

export default ModernProfilePage;
