'use client';

import React from "react";
// 1. Correct import for Vite + React Router
import { Link } from "react-router-dom"; 
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionTemplate, 
  useMotionValue 
} from "framer-motion";
import { 
  Sparkles, 
  Fingerprint, 
  GraduationCap, 
  MessageSquare, 
  ShieldCheck 
} from "lucide-react";
import Footer from "../components/Footer";

/* ============================
   INTERACTIVE HELPERS
============================ */
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-8deg", "8deg"]);

  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

const SpotlightButton = ({ children, className }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  return (
    <motion.button
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-sm transition-colors hover:border-pink-500/40 ${className}`}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useMotionTemplate`
            radial-gradient(100px circle at ${mx}px ${my}px,
            rgba(236,72,153,0.3),
            transparent 80%)
          `,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
        {children}
      </span>
    </motion.button>
  );
};

/* ============================
   MAIN COMPONENT
============================ */
export default function App() {
  const { scrollYProgress } = useScroll();
  
  // Spring config for smooth parallax
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Transform Logic for Sticky Sections
  const heroOpacity = useTransform(smooth, [0, 0.2, 0.25], [1, 1, 0]);
  const heroScale = useTransform(smooth, [0, 0.2], [1, 0.85]);
  const heroY = useTransform(smooth, [0, 0.2], [0, -100]);

  const featureOpacity = useTransform(smooth, [0.18, 0.28, 0.45, 0.52], [0, 1, 1, 0]);
  const featureY = useTransform(smooth, [0.18, 0.28, 0.45, 0.52], [100, 0, 0, -100]);
  const featureScale = useTransform(smooth, [0.18, 0.28], [0.9, 1]);

  const campusOpacity = useTransform(smooth, [0.48, 0.58, 0.75, 0.82], [0, 1, 1, 0]);
  const campusX = useTransform(smooth, [0.48, 0.58, 0.75, 0.82], [150, 0, 0, -150]);

  const ctaOpacity = useTransform(smooth, [0.78, 0.88], [0, 1]);
  const ctaScale = useTransform(smooth, [0.78, 0.88], [0.8, 1]);

  return (
    <div className="relative bg-neutral-950 text-white">
      
      {/* SECTION 1: HERO */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden z-[40]">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 text-pink-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-8">
            <Sparkles size={10} /> Experience Connection in 3D
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-pink-300 mb-8 tracking-tighter leading-none">
            Matches that <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-pink-400 to-pink-500">Actually Click.</span>
          </h1>
          
          <Link to="/signup">
            <SpotlightButton className="text-lg px-16 py-6 border-pink-600 !bg-pink-600/10">
              Start Your Vibe Check
            </SpotlightButton>
          </Link>
        </motion.div>
      </section>

      {/* SECTION 2: FEATURES */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6 z-[30]">
        <motion.div style={{ opacity: featureOpacity, y: featureY, scale: featureScale }} className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">Multi-Dimensional Dating</h2>
            <p className="text-pink-500/60 uppercase tracking-widest text-xs font-bold">How the Vibe ID works</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TiltCard className="h-[400px] rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-end group overflow-hidden">
              <Fingerprint className="text-pink-400 mb-6" size={48} strokeWidth={1} />
              <h3 className="text-2xl font-bold text-white mb-3">No Fake IDs</h3>
              <p className="text-slate-400 text-sm leading-relaxed">We verify profile photos belong to the actual person, preventing impersonation.</p>
            </TiltCard>
            <TiltCard className="h-[400px] rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-end group overflow-hidden md:-translate-y-12">
              <ShieldCheck className="text-pink-300 mb-6" size={48} strokeWidth={1} />
              <h3 className="text-2xl font-bold text-white mb-3">No Swipe Bias</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Matches are calculated from personality, not just swipe behavior.</p>
            </TiltCard>
            <TiltCard className="h-[400px] rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-end group overflow-hidden">
              <MessageSquare className="text-pink-400 mb-6" size={48} strokeWidth={1} />
              <h3 className="text-2xl font-bold text-white mb-3">Safe Interactions</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Block or report anytime to protect your personal space.</p>
            </TiltCard>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: CAMPUS */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6 z-[20]">
        <motion.div style={{ x: campusX, opacity: campusOpacity }} className="max-w-4xl w-full text-right">
          <div className="flex justify-end mb-8">
            <div className="w-20 h-20 bg-pink-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-pink-500/20">
              <GraduationCap size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter uppercase leading-none">Verified <br /> Campus <br /> Circles</h2>
          <div className="flex justify-end gap-3 flex-wrap">
            {[ "IITs", "NITs", "BITS", "VIT", "KIET", "MIT", "SRM", "Manipal", "Amity", "DTU", "NSUT", "JNU", "DU", "JU", "IIMs", "XLRI", "NMIMS", "Symbiosis", "Christ", "KIIT", "AKG", "ABES", "Galgotias", "Sharda", "LPU", "UPES", "and more…" ]
            .map((s) => (
              <span key={s} className="px-4 py-2 rounded-full border border-pink-500/20 bg-pink-500/5 text-[10px] font-bold text-pink-300/60">{s}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 4: FINAL CTA */}
      {/* SECTION 4: FINAL CTA (Changed Z-Index to be higher at the end) */}
<section className="sticky top-0 h-screen flex items-center justify-center px-6 z-[50] pointer-events-none">
  <motion.div 
    style={{ 
      scale: ctaScale, 
      opacity: ctaOpacity,
      // This line is the magic fix:
      pointerEvents: useTransform(smooth, [0.85, 0.9], ["none", "auto"]) 
    }} 
    className="text-center relative"
  >
    <div className="absolute inset-0 bg-pink-600/10 blur-[120px] rounded-full pointer-events-none" />
    <h2 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase leading-none relative">
      Find Your <br /> Frequency
    </h2>
    
    <Link to="/signup" className="relative z-[60]">
      <SpotlightButton className="text-lg px-16 py-6 border-pink-500/40 !bg-pink-600/10 cursor-pointer">
        Start Your Vibe Check
      </SpotlightButton>
    </Link>
  </motion.div>
</section>

{/* SCROLL SPACER - Ensure this is large enough */}
<div className="h-[400vh]" />

      {/* SCROLL DEPTH SPACER */}
      <div className="h-[400vh]" />
      
      
    </div>
  );
}