"use client";
import React, { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Fingerprint,
  Info,
  ShieldCheck,
  Camera,
} from "lucide-react";
import SelfieCapture from "../components/SelfieCapture";

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";


/* ============================
   INTERACTIVE HELPERS
============================ */
const SpotlightButton = ({ children, className, type = "button", disabled = false, onClick }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-sm transition-colors hover:border-pink-500/40 w-full disabled:opacity-50 ${className}`}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useMotionTemplate`
            radial-gradient(120px circle at ${mx}px ${my}px,
            rgba(236,72,153,0.3),
            transparent 80%)
          `,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
        {children}
      </span>
    </motion.button>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
  });
  const [step, setStep] = useState("signup");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selfieProcessing, setSelfieProcessing] = useState(false);
  const navigate = useNavigate();

  const startSelfieStep = (e) => {
    e.preventDefault();
    if (!formData.gender) {
      alert("Please select your gender.");
      return;
    }
    setStep("selfie");
  };

  const onSelfieCaptured = async (descriptor) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          descriptor: Array.from(descriptor),
        }),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to request OTP");

      setStep("otp");
    } catch (err) {
      alert(err.message);
      setStep("signup");
      throw err;
    } finally {
      setIsLoading(false);
      setSelfieProcessing(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, otp }),
      });
      if (response.ok) {
        navigate("/compatibilityform");
      } else {
        const data = await response.json();
        alert(data.error || "Invalid OTP");
      }
    } catch (err) {
      alert("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-pink-500/30 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-6 hover:bg-pink-500/10 transition-colors">
            <Sparkles size={12} /> AmoraOnline
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            {step === "signup" ? "Create " : step === "selfie" ? "Face " : "Verify "}
            <span className="text-pink-500">{step === "signup" ? "Vibe ID" : step === "selfie" ? "ID" : "Email"}</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {step === "signup" ? "Join your campus circle by using your campus email." : "Secure your community presence."}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-pink-500/5">
          
          {step === "signup" && (
            <form onSubmit={startSelfieStep} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={16} />
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 ml-1">Campus Email ID</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={16} />
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@yourcollege.edu"
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1 px-1">
                  Note: Use your official campus email ID to match with people within your college campus circles.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={16} />
                  <input
                    type="password" required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 ml-1">Gender Identity</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Male", "Female"].map((opt) => (
                    <button
                      key={opt} type="button"
                      onClick={() => setFormData({ ...formData, gender: opt })}
                      className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                        formData.gender === opt 
                        ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/20' 
                        : 'bg-neutral-900/50 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-start gap-2 bg-pink-500/5 border border-pink-500/20 p-4 rounded-2xl mt-4">
                  <Info className="text-pink-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[10px] text-pink-300/70 leading-relaxed">
                    Right now, we do not include LGBTQ+ community options. We are working and making things better slowly, so in the future we will include everyone.
                  </p>
                </div>
              </div>

              <SpotlightButton type="submit" className="mt-4">
                Get Started <ArrowRight size={14} className="ml-1" />
              </SpotlightButton>
            </form>
          )}

          {step === "selfie" && (
            <div className="space-y-6">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-inner bg-black relative">
                <SelfieCapture
                  modelsPath={`${import.meta.env.BASE_URL || '/'}models`}
                  setProcessing={(v) => setSelfieProcessing(!!v)}
                  onCaptured={onSelfieCaptured}
                />
              </div>
              
              {/* --- VERIFICATION DISCLAIMER --- */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="text-pink-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] md:text-xs text-slate-300 leading-relaxed">
                  <strong>Verification Note:</strong> This image will only be used to confirm that the person creating this account matches the individual in the profile pictures you upload later.
                </p>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
                   <Camera size={12} /> Please look directly into the camera
                </p>
                <button 
                  onClick={() => setStep("signup")}
                  className="mt-6 text-[10px] font-bold uppercase tracking-widest text-pink-500 hover:text-pink-400 border-b border-pink-500/20 pb-0.5 transition-colors"
                >
                  Edit Registration Details
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400">Verification Code</label>
                <div className="relative group max-w-[240px] mx-auto mt-2">
                  <input
                    type="text" required maxLength={6} value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-4 text-center text-xl tracking-[0.5em] font-mono text-white placeholder:text-slate-800 focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500">We sent a 6-digit code to your campus email.</p>
              <SpotlightButton type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Verify & Activate ID"}
              </SpotlightButton>
              <button 
                type="button" onClick={() => setStep("signup")}
                className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white"
              >
                Wrong Email Address?
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-slate-500">
            Already have a Vibe ID? <Link to="/login" className="text-pink-500 font-bold hover:underline ml-1">Log In</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            <ShieldCheck size={14} className="text-pink-500" />
            Verified Campus Network
          </div>
        </div>
      </motion.div>

      {/* Processing Global Loader */}
      {(selfieProcessing || isLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-3xl flex flex-col items-center gap-4 border-pink-500/20 shadow-2xl shadow-pink-500/10">
            <Loader2 className="animate-spin text-pink-500" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest text-white">
              {selfieProcessing ? "Scanning Face..." : "Verifying..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;