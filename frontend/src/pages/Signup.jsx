// Signup.jsx (client)
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Fingerprint,
  Users,
  ChevronDown, // Added for the select dropdown
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// --- SHARED UI COMPONENTS ---

const BackgroundGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 bg-[#05030a]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 0%, rgba(244, 63, 94, 0.15), transparent 50%),
          radial-gradient(circle at 90% 100%, rgba(168, 85, 247, 0.15), transparent 50%),
          radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.1), transparent 50%)
        `,
      }}
    />
    <div className="absolute inset-0 opacity-[0.2] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
  </div>
);

// --- MAIN COMPONENT ---

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
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.gender) {
      alert("Please select your gender.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (response.ok) {
        setStep("otp");
      } else {
        const data = await response.json();
        alert("⚠️ " + (data.message || "Error sending OTP"));
      }
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      alert("❌ Failed to connect to server");
    } finally {
      setIsLoading(false);
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
      const data = await response.json();
      if (response.ok) {
        navigate("/compatibilityform");
      } else {
        alert("⚠️ " + (data.error || "Invalid OTP or registration error"));
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      alert("❌ Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#05050a] text-slate-200 px-4">
      <BackgroundGrid />

      {/* Main Card Container - Reduced max-width and padding */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]" // Tighter max-width
      >
        {/* Refined Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/15 to-purple-500/15 blur-2xl -z-10 rounded-3xl" />

        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]">
          
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 mb-4 shadow-inner shadow-white/5">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
              {step === "signup" ? "Create Account" : "Verify Email"}
            </h2>
            <p className="text-zinc-400 text-sm font-light">
              {step === "signup" 
                ? "Join the community where chemistry matters." 
                : `We sent a code to ${formData.email}`}
            </p>
          </div>

          {step === "signup" ? (
            // --- SIGNUP FORM ---
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Name Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Full Name</label>
                <div className="relative group mt-1">
                  <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/40 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">College Email</label>
                <div className="relative group mt-1">
                  <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/40 transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-pink-300/70 ml-1 mt-1 flex items-center gap-1">
                  <Sparkles size={9} /> Required for exclusive campus access
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Password</label>
                <div className="relative group mt-1">
                  <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/40 transition-all"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Gender Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Gender</label>
                <div className="relative group mt-1">
                  <Users className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white appearance-none focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/40 transition-all cursor-pointer"
                    required
                  >
                    <option value="" className="bg-zinc-900 text-zinc-500">Select Identity</option>
                    <option value="Male" className="bg-zinc-900">Male</option>
                    <option value="Female" className="bg-zinc-900">Female</option>
                    <option value="Other" className="bg-zinc-900">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden after:absolute after:inset-0 after:bg-white/20 after:opacity-0 hover:after:opacity-100 after:transition-opacity"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            // --- OTP FORM ---
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">One-Time Password</label>
                <div className="relative group mt-1">
                  <Fingerprint className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-center tracking-[0.5em] font-mono placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/40 transition-all"
                    required
                    maxLength={6}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                 {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    Verify & Complete <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <button 
                type="button" 
                onClick={() => setStep('signup')}
                className="w-full text-xs text-zinc-500 hover:text-white transition-colors text-center"
              >
                Entered wrong email? Go back
              </button>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-xs">
            Already have an account?{" "}
            <span onClick={() => navigate('/login')} className="text-pink-400 hover:text-pink-300 cursor-pointer font-medium transition-colors underline underline-offset-4">
              Log in
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;