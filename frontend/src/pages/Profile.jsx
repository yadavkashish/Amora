"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Edit3,
  Upload,
  Flame,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X,
  Camera,
  Sparkles,
  Award,
  Compass,
  Loader,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ImagePlus,
  User, // Using User icon for gender tag clarity
  BookOpen, // Using BookOpen for Year/Branch
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============================================================================
// LOADING SKELETON
// ============================================================================
function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-44 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl" />
      <div className="space-y-4 p-4 sm:p-0">
        <div className="h-12 w-64 bg-gray-200 rounded-lg" />
        <div className="h-20 w-full bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// FULLSCREEN IMAGE VIEWER MODAL
// ============================================================================
const FullscreenImageViewer = ({ images, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    setCurrentIndex(initialIndex || 0);
  }, [initialIndex, isOpen]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all z-50"
      >
        <X className="w-6 h-6" />
      </motion.button>

      <div
        className="w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          src={images[currentIndex]}
          alt={`Full view ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {images.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </motion.button>
        </>
      )}

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white rounded-full font-semibold text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      <div className="absolute bottom-4 right-4 text-white/60 text-xs sm:text-sm hidden sm:block">
        Use ← → or arrow keys to navigate, ESC to close
      </div>
    </motion.div>
  );
};

// ============================================================================
// PHOTO GRID COMPONENT
// ============================================================================
const PhotoGrid = ({ images, onPhotoClick, onAddImage }) => {
  const inputRef = React.useRef(null);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    onAddImage && onAddImage(files);
  };

  if (!images || images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-6 sm:p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          📸 Photos
        </h2>
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="text-center text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">No photos yet</p>
            <p className="text-sm text-gray-500 mt-2">Add your first photos</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <button
            onClick={() => inputRef.current?.click()}
            className="absolute right-4 bottom-4 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition flex items-center gap-1 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Photos
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          📸 Photos ({images.length})
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
        <AnimatePresence>
          {images.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: idx * 0.02 }}
              className="relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-40 sm:h-48 bg-gray-200 aspect-square"
            >
              <img
                src={image}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-300"
                onClick={() => onPhotoClick(idx)}
              />

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPhotoClick(idx)}
                  className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full transition-all"
                  title="View full size"
                >
                  <Maximize2 className="w-5 h-5" />
                </motion.button>
              </motion.div>

              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs font-semibold rounded-full">
                {idx + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ALWAYS show Add Photos tile */}
        <motion.label
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03 }}
          className="relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-40 sm:h-48 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-dashed border-pink-300 hover:border-pink-500 cursor-pointer flex items-center justify-center aspect-square"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600 mx-auto mb-2" />
            <span className="font-semibold text-pink-600 text-sm sm:text-base">Add Photos</span>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </motion.label>
      </div>

      <p className="text-sm text-gray-600 text-center mt-4">
        Click on any photo to view full size
      </p>
    </motion.div>
  );
};

// ============================================================================
// PROFILE HEADER (UPDATED FOR CENTERING AND WIDER MAX-WIDTH)
// ============================================================================
const ProfileHeader = ({
  profile,
  onEditClick,
  personalityType,
  onAddPhotos,
  onCoverSelect,
  openViewer,
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);
  const navigate = useNavigate();

  if (!profile) return <LoadingSkeleton />;

  const handleAddPhotosClick = () => fileInputRef.current?.click();
  const handleFiles = (files) => files && files.length && onAddPhotos?.(files);
  const handleCoverFiles = (files) =>
    files && files.length && onCoverSelect?.(files[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* COVER */}
      <div className="relative rounded-t-3xl overflow-hidden shadow-2xl h-36 sm:h-44 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,0,0,0.06),transparent)]" />

        {/* Change cover button (top right) */}
        {/* <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => coverInputRef.current?.click()}
          className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition z-10"
          title="Change cover image"
        >
          <Camera className="w-5 h-5 text-gray-700" />
        </motion.button> */}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleCoverFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* PROFILE CARD (overlapping) */}
      <div className="bg-white rounded-b-3xl shadow-2xl px-6 pt-16 pb-6 sm:px-8 sm:pb-8 relative">
        {/* Avatar - overlapping */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute -top-14 left-6 sm:left-8"
        >
          {profile?.profilePic && !imageError ? (
            <img
              src={profile.profilePic}
              onError={() => setImageError(true)}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[6px] border-white shadow-2xl object-cover cursor-pointer"
              alt={profile.name}
              onClick={() => openViewer?.(0)}
            />
          ) : (
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[6px] border-white shadow-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center cursor-pointer"
              onClick={() => openViewer?.(0)}
            >
              <span className="text-3xl sm:text-4xl text-white font-bold">
                {profile?.name?.charAt(0) || "U"}
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg" />
        </motion.div>

        {/* Name + Details container */}
        <div className="mt-8 sm:mt-0 pt-0 sm:pt-0">
          
          {/* TOP ROW: Name, Age, Location (Aligned Left) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            
            {/* Name and Location (Shifts to the right of avatar on sm+) */}
            <div className="flex-1 flex flex-col justify-center order-2 sm:order-1 sm:pl-[110px] md:pl-[140px]"> 
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                  {profile?.name || "Your Name"}
                  {profile?.age && (
                    <span className="text-gray-600 text-2xl">
                      , {profile.age}
                    </span>
                  )}
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 flex items-center gap-2 text-lg mt-1"
              >
                <MapPin className="w-5 h-5 text-pink-500" />
                {profile?.location || "Location not set"}
              </motion.p>
            </div>
          </div>

          {/* CONTENT BELOW TOP HEADER (Bio, Tags, Interests, Buttons) */}
          <div className="w-full mt-6">
            
            {/* Bio (Full width, centered, WIDER) */}
            {profile?.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-700 leading-relaxed mt-6 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100 italic mx-auto max-w-5xl" // **WIDER MAX WIDTH (5xl)**
              >
                {profile.bio}
              </motion.p>
            )}

            {/* Tags (Gender, Preference, Personality, Education - Centered, WIDER) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 mx-auto max-w-5xl" // **CENTERED TAGS, WIDER MAX WIDTH**
            >
              {profile?.gender && (
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> {profile.gender}
                </span>
              )}
              {profile?.preference && (
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-blue-700" /> {profile.preference}
                </span>
              )}
              {personalityType && (
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {personalityType}
                </span>
              )}
              {profile?.branch && (
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> {profile.branch}
                </span>
              )}
              {profile?.year && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4" /> Year {profile.year}
                </span>
              )}
            </motion.div>

            {/* Interests (Full width, centered, WIDER) */}
            {profile?.interests && profile.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl w-full border border-purple-100 mx-auto max-w-5xl" // **CENTERED INTERESTS, WIDER MAX WIDTH**
              >
                <p className="font-semibold text-gray-900 mb-3 text-center">✨ Interests</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---------- ACTION BUTTONS (Centered, WIDER) ---------- */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-3 mt-8 justify-center w-full mx-auto max-w-5xl" // **CENTERED BUTTONS, WIDER MAX WIDTH**
            >
              <button
                onClick={() => navigate("/personality-report")}
                className="flex-1 min-w-[150px] sm:flex-none px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-base hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2"
              >
                🧠 View Report
              </button>

              <button
                onClick={onEditClick}
                className="flex-1 min-w-[150px] sm:flex-none px-6 py-3 rounded-xl bg-pink-500 text-white font-bold text-base hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-5 h-5" /> Edit Profile
              </button>

              <button
                onClick={handleAddPhotosClick}
                className="flex-1 min-w-[150px] sm:flex-none px-6 py-3 rounded-xl bg-white border border-gray-30o text-gray-700 font-semibold text-base hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Photos
              </button>
            </motion.div>
          </div>
        </div>

        {/* Hidden file input for Photo Grid/Add button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
    </motion.div>
  );
};

// ============================================================================
// STATS SECTION
// ============================================================================
const StatsSection = ({ stats, loading }) => {
  const defaultStats = [
    {
      icon: Flame,
      label: "Perfect Matches",
      value: stats?.perfectMatches ?? "0",
      subtitle: "80%+ compatibility",
      color: "from-red-500 to-pink-500",
      lightColor: "from-red-50 to-pink-50",
    },
    {
      icon: Zap,
      label: "Great Matches",
      value: stats?.greatMatches ?? "0",
      subtitle: "60-80% compatibility",
      color: "from-yellow-500 to-orange-500",
      lightColor: "from-yellow-50 to-orange-50",
    },
    {
      icon: TrendingUp,
      label: "Avg Compatibility",
      value: stats?.avgCompatibility ? `${stats.avgCompatibility}%` : "--",
      subtitle: "Across all matches",
      color: "from-blue-500 to-cyan-500",
      lightColor: "from-blue-50 to-cyan-50",
    },
    {
      icon: Users,
      label: "Total Matches",
      value: stats?.totalMatches ?? "0",
      subtitle: "From your campus",
      color: "from-purple-500 to-pink-500",
      lightColor: "from-purple-50 to-pink-50",
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          📊 Your Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 sm:h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        📊 Your Stats
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {defaultStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-gradient-to-br ${s.lightColor} rounded-2xl p-4 sm:p-6 overflow-hidden group hover:shadow-lg transition-all`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />
                </div>
                <p className="text-sm text-gray-600 font-medium">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 my-1 sm:my-2">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500">{s.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// PERSONALITY INSIGHTS
// ============================================================================
const PersonalityInsights = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          🧠 Your Personality
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-2 border-dashed border-purple-200">
        <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Complete Your Personality Quiz
        </h3>
        <p className="text-gray-600">
          Take our assessment to unlock personalized insights and better
          matches!
        </p>
      </div>
    );
  }

  const insights = [
    {
      icon: Heart,
      label: "Personality Type",
      value:
        report?.aiGeneratedReport?.personalityType?.name ||
        report?.personalityProfile ||
        "—",
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
    {
      icon: Award,
      label: "Love Language",
      value: report?.aiGeneratedReport?.relationshipApproach || "—",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      icon: Compass,
      label: "Conflict Style",
      value: report?.aiGeneratedReport?.conflictResolutionStyle || "Balanced",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: Zap,
      label: "Enneagram Type",
      value: report?.enneagramType || "—",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        🧠 Your Personality
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${ins.bg} rounded-2xl p-4 flex items-center gap-4 group hover:shadow-lg transition-all border border-transparent hover:border-gray-200`}
            >
              <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${ins.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">{ins.label}</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {ins.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {report?.aiGeneratedReport?.personalityNarrative && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
        >
          <p className="text-gray-700 text-sm leading-relaxed">
            {report.aiGeneratedReport.personalityNarrative}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// STRENGTHS SECTION
// ============================================================================
const StrengthsSection = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">💪 Strengths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const strengths = report?.aiGeneratedReport?.strengths || [];
  const developmentAreas = report?.aiGeneratedReport?.developmentAreas || [];

  if (!strengths.length && !developmentAreas.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {strengths.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            ⭐ Strengths
          </h2>
          <ul className="space-y-3">
            {strengths.slice(0, 5).map((strength, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-200"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {developmentAreas.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            🌱 Growth Areas
          </h2>
          <ul className="space-y-3">
            {developmentAreas.slice(0, 5).map((area, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200"
              >
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{area}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EDIT PROFILE MODAL
// ============================================================================
const EditProfileModal = ({ profile, isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState(profile || {});
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    setFormData(profile || {});
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, newImages, []);
    setNewImages([]);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">✏️ Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age || ""}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender || ""}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(formData.bio || "").length}/500
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Interests (comma-separated)</label>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader className="w-5 h-5 animate-spin" />}
            {isLoading ? "Saving..." : "Save Changes"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================
const EmptyProfileState = ({ onGetStarted }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 sm:p-12 text-center text-white max-w-lg mx-auto"
    >
      <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6" />
      <h2 className="text-3xl font-bold mb-4">Complete Your Profile</h2>
      <p className="text-base sm:text-lg mb-8 opacity-90">
        Fill in your details and take our personality quiz to unlock
        personalized matches and insights!
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGetStarted}
        className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
      >
        Get Started Now
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
function ModernProfilePage() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const navigate = useNavigate();

  const BASE_URL = API_URL.replace(/\/$/, "");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const profileRes = await fetch(`${BASE_URL}/api/profile/latest`, {
        credentials: "include",
      });

      if (!profileRes.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await profileRes.json();
      setProfile(profileData);

      const reportRes = await fetch(`${BASE_URL}/api/personality/my-report`, {
        credentials: "include",
      });

      if (reportRes.ok) {
        const reportData = await reportRes.json();
        setReport(reportData?.report || null);
      }

      try {
        const allMatchesRes = await fetch(
          `${BASE_URL}/api/compatibility/all-matches`,
          { credentials: "include" }
        );

        if (allMatchesRes.ok) {
          const matchesData = await allMatchesRes.json();
          const matches = matchesData?.matches || [];

          const perfect = matches.filter((m) => m.compatibility >= 80).length;
          const great = matches.filter(
            (m) => m.compatibility >= 60 && m.compatibility < 80
          ).length;
          const avg =
            matches.length > 0
              ? Math.round(
                  matches.reduce((sum, m) => sum + m.compatibility, 0) /
                    matches.length
                )
              : 0;

          setStats({
            perfectMatches: perfect,
            greatMatches: great,
            avgCompatibility: avg,
            totalMatches: matches.length,
          });
        }
      } catch (err) {
        console.warn("Could not fetch stats:", err);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || String(err));
      setIsLoading(false);
    }
  };

  const handleAddPhotos = async (files) => {
    if (!files || files.length === 0 || !profile?._id) return;
    try {
      setIsSaving(true);
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("morePics", f));
      const res = await fetch(`${BASE_URL}/api/profile/${profile._id}/photos`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to upload photos");
      }
      await fetchData();
    } catch (err) {
      console.error("Photo upload error:", err);
      alert("Failed to upload photos: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverUpload = async (file) => {
  if (!file || !profile?._id) return;

  try {
    setIsSaving(true);
    const fd = new FormData();
    fd.append("coverImage", file);

    const BASE_URL = (API_URL || "http://localhost:5000").replace(/\/$/, "");
    
    // Use the /cover endpoint or include in main PUT
    const res = await fetch(`${BASE_URL}/api/profile/${profile._id}/cover`, {
      method: "PUT",
      body: fd,
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to upload cover");
    }

    // Refresh profile
    await fetchData();
    alert("Cover updated!");
  } catch (err) {
    console.error("Cover error:", err);
    alert("Failed to upload cover: " + err.message);
  } finally {
    setIsSaving(false);
  }
};


  const handleSaveProfile = async (formData, newImages, removedImages) => {
    try {
      setIsSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("age", formData.age);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("location", formData.location);

      if (formData.interests) {
        formData.interests.forEach((interest) => {
          formDataToSend.append("interests[]", interest);
        });
      }

      newImages.forEach((img) => {
        formDataToSend.append("morePics", img);
      });

      if (formData.morePics) {
        formData.morePics.forEach((pic) => {
          formDataToSend.append("existingMorePics[]", pic);
        });
      }

      const res = await fetch(`${BASE_URL}/api/profile/${profile._id}`, {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setIsEditing(false);

      setTimeout(() => fetchData(), 500);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoClick = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleAddPhotosLocal = async (files) => {
    await handleAddPhotos(files);
  };

  const allImages = [];
  if (profile?.profilePic) allImages.push(profile.profilePic);
  if (profile?.morePics && Array.isArray(profile.morePics)) {
    allImages.push(...profile.morePics);
  }

  // --- Render based on State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center"
        >
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            An Error Occurred
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Reload Page
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 py-12 pt-24">
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!profile || !profile.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
        <EmptyProfileState onGetStarted={() => setIsEditing(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 py-12 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          personalityType={
            report?.aiGeneratedReport?.personalityType?.name ||
            report?.personalityProfile
          }
          onEditClick={() => setIsEditing(true)}
          onAddPhotos={handleAddPhotosLocal}
          onCoverSelect={handleCoverUpload}
          openViewer={(idx = 0) => {
            setViewerIndex(idx);
            setViewerOpen(true);
          }}
        />

        {/* Photo Grid */}
        <PhotoGrid
          images={allImages}
          onPhotoClick={handlePhotoClick}
          onAddImage={handleAddPhotosLocal}
        />

        {/* Stats Section */}
        <StatsSection stats={stats} loading={isLoading} />

        {/* Personality Insights */}
        <PersonalityInsights report={report} loading={isLoading} />

        {/* Strengths & Growth */}
        <StrengthsSection report={report} loading={isLoading} />

        {/* CTA Button */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={() => navigate("/personality-report")}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all inline-flex items-center gap-2 text-lg"
            >
              View Full Personality Report
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <EditProfileModal
            profile={profile}
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            onSave={handleSaveProfile}
            isLoading={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ModernProfilePage;