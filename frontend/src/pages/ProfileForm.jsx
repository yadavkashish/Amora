'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, BookOpen, Camera, CheckCircle, Loader, AlertCircle, XCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';
import Select from "react-select";
import { City } from "country-state-city";
import imageCompression from "browser-image-compression";

// --- Image Compression ---
async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true
  };

  try {
    return await imageCompression(file, options);
  } catch (err) {
    console.error("Compression failed:", err);
    return file;
  }
}

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";

/* --- Framer Motion Variants --- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 50 }
  }
};

/* --- UI Components --- */
const InputGroup = ({ children, title, icon: Icon }) => (
  <motion.div
    variants={itemVariants}
    className="bg-[#0c050a]/50 backdrop-blur-md p-6 rounded-2xl border border-pink-900/30 shadow-xl"
  >
    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-3 border-b border-pink-900/30 pb-3">
      <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
        <Icon className="w-5 h-5" />
      </div>
      {title}
    </h3>
    <div className="space-y-5">{children}</div>
  </motion.div>
);

export default function ProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', bio: '', preference: '',
    location: '', interests: '', course: '', year: '',
  });
  const [gps, setGps] = useState(null);

  const cityOptions = useMemo(() => {
    return City.getCitiesOfCountry("IN").map((c) => ({
      value: `${c.name}, ${c.stateCode}, ${c.countryCode}`,
      label: `${c.name}, ${c.stateCode}, ${c.countryCode}`,
    }));
  }, []);

  // Generate dynamic pass out years (e.g., from 2015 to 2032)
  const currentYear = new Date().getFullYear();
  const passOutYears = Array.from({ length: 18 }, (_, i) => currentYear + 6 - i);

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(null);
  const profilePreviewRef = useRef(null);
  const [morePicsFiles, setMorePicsFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // face-api states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [verifyState, setVerifyState] = useState(null);
  const [verifyDist, setVerifyDist] = useState(null);
  const [verifiedDescriptor, setVerifiedDescriptor] = useState(null); 
  const verifyAbortRef = useRef(false);

  const MODELS_BASE = `${import.meta.env.BASE_URL || '/'}models`.replace(/\/+/g, '/');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        console.log("Location permission denied");
      }
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(`${MODELS_BASE}/tiny_face_detector`);
        await faceapi.nets.faceLandmark68Net.loadFromUri(`${MODELS_BASE}/face_landmark_68`);
        await faceapi.nets.faceRecognitionNet.loadFromUri(`${MODELS_BASE}/face_recognition`);
        if (!mounted) return;
        setModelsLoaded(true);
        console.log('[ProfileForm] Models loaded');
      } catch (err) {
        console.error('[ProfileForm] Failed to load models', err);
        setModelsLoaded(false);
      }
    })();
    return () => { mounted = false; verifyAbortRef.current = true; revokePreviewUrl(); };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
      img.src = url;
    });
  }

  function revokePreviewUrl() {
    if (profilePreviewRef.current) {
      try { URL.revokeObjectURL(profilePreviewRef.current); } catch (e) {}
      profilePreviewRef.current = null;
    }
    setProfilePreviewUrl(null);
  }

  const handleProfilePicSelected = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large. Please upload a photo under 10MB.");
      return;
    }

    const compressedFile = await compressImage(file);
    setVerifyState(null);
    setVerifyDist(null);
    setVerifiedDescriptor(null);
    revokePreviewUrl();

    if (!modelsLoaded) {
      setVerifyState('error');
      alert('Face verification models are loading. Please wait.');
      return;
    }

    setVerifyState('checking');

    try {
      const img = await loadImageFromFile(compressedFile);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection || !detection.descriptor) {
        setVerifyState('no_face');
        setProfilePicFile(null);
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);

      const res = await fetch(`${API_URL}/api/auth/compare-profile-descriptor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileDescriptor: descriptorArray }),
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        setVerifyState('error');
        alert('Not authorized. Please log in.');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setVerifyState('error');
        alert(data.error || 'Verification failed.');
        return;
      }

      const { matched, dist } = data;
      setVerifyDist(typeof dist === 'number' ? dist.toFixed(4) : null);

      if (matched) {
        setVerifiedDescriptor(descriptorArray);
        const objUrl = URL.createObjectURL(compressedFile);
        profilePreviewRef.current = objUrl;
        setProfilePreviewUrl(objUrl);
        setProfilePicFile(compressedFile);
        setVerifyState('matched');
      } else {
        setVerifyState('not_matched');
        setProfilePicFile(null);
        setVerifiedDescriptor(null);
      }
    } catch (err) {
      console.error(err);
      setVerifyState('error');
      setProfilePicFile(null);
      setVerifiedDescriptor(null);
    }
  };

  const handleFileChange = (e, type) => {
    if (type === 'profilePic') {
      handleProfilePicSelected(e.target.files[0]);
    } else if (type === 'morePics') {
      const files = Array.from(e.target.files).slice(0, 5);
      Promise.all(files.map(f => compressImage(f)))
        .then((compressed) => {
          setMorePicsFiles(compressed);
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (verifyState !== 'matched' || !profilePicFile || !verifiedDescriptor) {
      alert('Please upload a profile picture that matches your signup selfie (verification required).');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'interests') {
          (value || '').split(',').map(i => i.trim()).filter(i => i).forEach(i => data.append('interests', i));
        } else if (value) {
          data.append(key, value);
        }
      });

      data.append('profilePic', profilePicFile);
      morePicsFiles.forEach(f => data.append('morePics', f));
      data.append('profileDescriptor', JSON.stringify(verifiedDescriptor));

      if (gps && typeof gps.lat === "number" && typeof gps.lng === "number" && !isNaN(gps.lat) && !isNaN(gps.lng)) {
        data.append("lat", gps.lat);
        data.append("lng", gps.lng);
      }

      const res = await fetch(`${API_URL}/api/profile/create`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Profile creation failed:', errData);
        alert(errData.error || 'Error creating profile');
        return;
      }
      await res.json();
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert('Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const inputBaseClass = `
    w-full bg-black/40 border border-pink-900/30 rounded-xl px-4 py-3 
    text-gray-100 placeholder-gray-500
    focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none 
    transition-all duration-200
  `;

  const labelClass = 'block text-xs font-semibold text-pink-500/80 uppercase tracking-wider mb-2 ml-1';
  const fileInputClass = `
    block w-full text-sm text-gray-400 
    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
    file:text-sm file:font-semibold file:bg-pink-500/10 file:text-pink-400 
    hover:file:bg-pink-500/20 file:transition cursor-pointer
  `;

  return (
    <div className="min-h-screen bg-[#070305] text-gray-100 font-sans selection:bg-pink-500/30">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-white"
            >
              Setup Profile
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto">
              Complete your persona to match with others.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Group 1: Personal Basics */}
            <InputGroup title="Identity" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} required className={inputBaseClass} placeholder="John Doe" />
                </div>
                <div>
                  <label className={labelClass}>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required className={inputBaseClass} placeholder="21" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required className={`${inputBaseClass} appearance-none`}>
                    <option value="" className="bg-[#0c050a]">Select Identity</option>
                    <option value="Male" className="bg-[#0c050a]">Male</option>
                    <option value="Female" className="bg-[#0c050a]">Female</option>
                    <option value="Other" className="bg-[#0c050a]">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Interested In</label>
                  <select name="preference" value={formData.preference} onChange={handleChange} required className={`${inputBaseClass} appearance-none`}>
                    <option value="" className="bg-[#0c050a]">Select Preference</option>
                    <option value="Male" className="bg-[#0c050a]">Male</option>
                    <option value="Female" className="bg-[#0c050a]">Female</option>
                    <option value="Other" className="bg-[#0c050a]">Other</option>
                    <option value="Any" className="bg-[#0c050a]">Any</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <Select
                  options={cityOptions}
                  placeholder="Search city..."
                  value={
                    formData.location
                      ? { label: formData.location, value: formData.location }
                      : null
                  }
                  onChange={(selected) =>
                    setFormData((s) => ({
                      ...s,
                      location: selected?.value || "",
                    }))
                  }
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#0c050a",
                      border: "1px solid rgba(131, 24, 67, 0.3)",
                      color: "white",
                      maxHeight: 250,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#db2777" : "#0c050a", // pink-600
                      color: "white",
                      cursor: "pointer",
                    }),
                    control: (base) => ({
                      ...base,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderColor: "rgba(131, 24, 67, 0.3)",
                      minHeight: "48px",
                      borderRadius: "0.75rem",
                    }),
                    singleValue: (base) => ({ ...base, color: "white" }),
                    input: (base) => ({ ...base, color: "white" }),
                  }}
                />
              </div>
            </InputGroup>

            {/* Academic Details */}
            <InputGroup title="Academics" icon={BookOpen}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Course / Degree</label>
                  <select name="course" value={formData.course} onChange={handleChange} className={inputBaseClass}>
                    <option value="" className="bg-[#0c050a]">Select Degree</option>
                    <optgroup label="Engineering & Technology">
                      <option className="bg-[#0c050a]">B.Tech / BE</option>
                      <option className="bg-[#0c050a]">M.Tech / ME</option>
                      <option className="bg-[#0c050a]">BCA</option>
                      <option className="bg-[#0c050a]">MCA</option>
                      <option className="bg-[#0c050a]">B.Sc (IT/CS)</option>
                      <option className="bg-[#0c050a]">M.Sc (IT/CS)</option>
                    </optgroup>
                    <optgroup label="Business & Management">
                      <option className="bg-[#0c050a]">BBA</option>
                      <option className="bg-[#0c050a]">MBA</option>
                      <option className="bg-[#0c050a]">B.Com</option>
                      <option className="bg-[#0c050a]">M.Com</option>
                    </optgroup>
                    <optgroup label="Medical & Pharmacy">
                      <option className="bg-[#0c050a]">MBBS</option>
                      <option className="bg-[#0c050a]">BDS</option>
                      <option className="bg-[#0c050a]">B.Pharma</option>
                      <option className="bg-[#0c050a]">M.Pharma</option>
                      <option className="bg-[#0c050a]">B.Sc (Nursing)</option>
                    </optgroup>
                    <optgroup label="Arts, Science & Law">
                      <option className="bg-[#0c050a]">BA</option>
                      <option className="bg-[#0c050a]">MA</option>
                      <option className="bg-[#0c050a]">B.Sc</option>
                      <option className="bg-[#0c050a]">M.Sc</option>
                      <option className="bg-[#0c050a]">LLB</option>
                      <option className="bg-[#0c050a]">LLM</option>
                    </optgroup>
                    <optgroup label="Architecture & Other">
                      <option className="bg-[#0c050a]">B.Arch</option>
                      <option className="bg-[#0c050a]">M.Arch</option>
                      <option className="bg-[#0c050a]">Ph.D</option>
                      <option className="bg-[#0c050a]">Diploma</option>
                      <option className="bg-[#0c050a]">Other</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Pass Out Year</label>
                  <select name="year" value={formData.year} onChange={handleChange} className={inputBaseClass}>
                    <option value="" className="bg-[#0c050a]">Select Year</option>
                    {passOutYears.map(yr => (
                      <option key={yr} value={yr} className="bg-[#0c050a]">{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </InputGroup>

            {/* Vibe & Interests */}
            <InputGroup title="Vibe Check" icon={Heart}>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} className={inputBaseClass} rows="4" placeholder="What keeps you busy? What are you passionate about?" />
              </div>
              <div>
                <label className={labelClass}>Interests (comma separated)</label>
                <input name="interests" value={formData.interests} onChange={handleChange} className={inputBaseClass} placeholder="Coding, Gym, Anime, Chess..." />
              </div>
            </InputGroup>

            {/* Photos */}
            <InputGroup title="Gallery & Verification" icon={Camera}>
              <div>
                <label className={labelClass}>Primary Photo (Verification Required)</label>
                <div className="p-4 border border-dashed border-pink-900/50 rounded-xl bg-black/20 hover:bg-black/40 transition-colors">
                  <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'profilePic')} className={fileInputClass} />
                </div>

                {/* Verification Status UI */}
                <div className="mt-4">
                  {verifyState === 'checking' && (
                    <div className="flex items-center gap-3 text-sm text-pink-300 bg-pink-500/10 p-3 rounded-lg border border-pink-500/20">
                      <Loader className="animate-spin w-4 h-4" /> Analyzing biometric data...
                    </div>
                  )}

                  {verifyState === 'matched' && profilePreviewUrl && (
                    <div className="flex items-center gap-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <img src={profilePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-full ring-2 ring-emerald-500/50" />
                      <div>
                        <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Verified Identity
                        </div>
                        {verifyDist && <div className="text-xs text-emerald-500/60 mt-0.5">Confidence Score: {verifyDist}</div>}
                        <div className="mt-1 text-xs text-emerald-300">Descriptor ready — will be sent with profile.</div>
                      </div>
                    </div>
                  )}

                  {verifyState === 'not_matched' && (
                    <div className="flex gap-3 p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 text-sm">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Verification Failed.</span> This photo does not match your signup selfie. Please upload a clear photo of yourself.
                      </div>
                    </div>
                  )}

                  {(verifyState === 'no_face' || verifyState === 'error') && (
                    <div className="flex gap-3 p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>Could not detect a clear face. Please try a different photo with good lighting.</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Additional Photos (Optional, Max 5)</label>
                <div className="p-4 border border-dashed border-pink-900/50 rounded-xl bg-black/20 hover:bg-black/40 transition-colors">
                  <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'morePics')} className={fileInputClass} />
                </div>

                {morePicsFiles.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {morePicsFiles.map((file, i) => (
                      <div key={i} className="relative group flex-shrink-0">
                        <img src={URL.createObjectURL(file)} alt={`Extra ${i}`} className="w-20 h-20 object-cover rounded-lg border border-pink-900/50 shadow-lg" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </InputGroup>

            {/* Custom Submit Button to match uploaded image */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`
                w-full py-5 mt-6 rounded-full text-white font-bold text-[15px] tracking-[0.15em]
                bg-gradient-to-r from-[#5a183d] to-[#12050e]
                hover:from-[#752050] hover:to-[#1f0918]
                focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_0_25px_-5px_rgba(219,39,119,0.3)] transition-all transform
                flex items-center justify-center gap-3 border border-[#852458]/30
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <> <Loader className="animate-spin w-5 h-5" /> Processing... </>
              ) : (
                <>START YOUR VIBE CHECK</>
              )}
            </motion.button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}