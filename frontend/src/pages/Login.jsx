"use client";
import React, { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  KeyRound,
  Fingerprint,
  RotateCcw,
  ShieldCheck
} from "lucide-react";


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

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

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
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('❌ Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!formData.email) {
        alert("Please enter your email first.");
        return;
    }
    setLoading(true);
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
        alert('⚠️ Error sending OTP.');
      }
    } catch (err) {
      alert('❌ Server error');
    } finally {
      setLoading(false);
    }
  };

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
        alert('✅ Success! Login with your new password.');
        setShowForgot(false);
      } else {
        alert('⚠️ Invalid OTP or expired.');
      }
    } catch (err) {
      alert('❌ Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-pink-500/30 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      
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
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-6 hover:bg-pink-500/10 transition-colors">
            <Sparkles size={12} /> AmoraOnline
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            {showForgot ? "Reset " : "Welcome "} 
            <span className="text-pink-500">{showForgot ? "Access" : "Back"}</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {showForgot ? "We'll get you back into your circle." : "Reconnect with your frequency."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-pink-500/5">
          
          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={16} />
                  <input
                    type="email" required
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400">Password</label>
                  <button type="button" onClick={handleForgot} className="text-[10px] font-bold uppercase text-slate-500 hover:text-pink-500 transition-colors">
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={16} />
                  <input
                    type="password" required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
              </div>

              <SpotlightButton type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : <>Sign In <ArrowRight size={14} className="ml-1" /></>}
              </SpotlightButton>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {/* OTP */}
              <div className="space-y-1.5 text-center">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400">One-Time Password</label>
                <div className="relative group mt-2 max-w-[200px] mx-auto">
                  <input
                    type="text" required maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-4 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 ml-1">New Password</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password" required
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
              </div>

              <SpotlightButton type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Reset & Log In"}
              </SpotlightButton>

              <button 
                type="button" 
                onClick={() => setShowForgot(false)}
                className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-slate-500">
            New to AmoraOnline? <Link to="/signup" className="text-pink-500 font-bold hover:underline ml-1">Create Vibe ID</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            <ShieldCheck size={14} className="text-pink-500" />
            Secure Session Encryption
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;