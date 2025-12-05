// Login.jsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  KeyRound,
  Fingerprint,
  RotateCcw
} from "lucide-react";

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

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  // 🔹 Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        alert(Object.values(data.errors || { error: data.error || 'Login failed' }).join('\n'));
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('❌ Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Request OTP for reset
  const handleForgot = async () => {
    if (!formData.email) {
        alert("Please enter your email address in the field above first.");
        return;
    }
    
    setLoading(true); // visual feedback
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        alert('📩 OTP sent to your email!');
        setShowForgot(true);
      } else {
        alert('⚠️ Failed to send OTP. Check email and try again.');
      }
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      alert('❌ Server error');
    } finally {
        setLoading(false);
    }
  };

  // 🔹 Reset password with OTP
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp, newPassword }),
      });

      if (res.ok) {
        alert('✅ Password reset successful! Please login with your new password.');
        setShowForgot(false);
        setOtp('');
        setNewPassword('');
      } else {
        alert('⚠️ Failed to reset password. Invalid OTP or expired.');
      }
    } catch (err) {
      console.error('❌ Reset password error:', err);
      alert('❌ Server error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#05050a] text-slate-200 px-4">
      <BackgroundGrid />

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/15 to-purple-500/15 blur-2xl -z-10 rounded-3xl" />

        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]">
          
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 mb-4 shadow-inner shadow-white/5">
              {showForgot ? (
                 <RotateCcw className="w-5 h-5 text-pink-400" />
              ) : (
                 <Sparkles className="w-5 h-5 text-pink-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
              {showForgot ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className="text-zinc-400 text-sm font-light">
              {showForgot 
                ? "Enter the OTP sent to your email" 
                : "Enter your details to sign in"}
            </p>
          </div>

          {!showForgot ? (
            // --- LOGIN FORM ---
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Email</label>
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
              </div>

              {/* Password */}
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
                  />
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        type="button"
                        onClick={handleForgot}
                        disabled={loading}
                        className="text-xs text-zinc-500 hover:text-pink-400 transition-colors"
                    >
                        Forgot Password?
                    </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            // --- RESET PASSWORD FORM ---
            <form onSubmit={handleReset} className="space-y-4">
               {/* OTP Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">One-Time Password</label>
                <div className="relative group mt-1">
                  <Fingerprint className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-700 tracking-widest focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/40 transition-all"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">New Password</label>
                <div className="relative group mt-1">
                  <KeyRound className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/40 transition-all"
                    required
                  />
                </div>
              </div>

               <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                 {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    Reset Password <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full text-xs text-zinc-500 hover:text-white transition-colors text-center mt-4"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
            <p className="text-zinc-500 text-xs">
            Don't have an account?{" "}
            <span 
                onClick={() => navigate('/signup')} 
                className="text-pink-400 hover:text-pink-300 cursor-pointer font-medium transition-colors underline underline-offset-4"
            >
                Create one
            </span>
            </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;