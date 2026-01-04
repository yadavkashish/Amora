import React, { useEffect, useState, useRef } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate 
} from "framer-motion";
import { 
  Sparkles, 
  Heart, 
  Fingerprint, 
  GraduationCap, 
  MessageSquare, 
  ShieldCheck,
  Instagram, 
  Twitter, 
  Linkedin, 
  Github, 
  ArrowRight,
  Mail
} from "lucide-react";
import Footer from "../components/Footer";

/* ============================
   FOOTER HELPERS
============================ */
const SocialButton = ({ icon: Icon, href }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3 }}
    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-300"
  >
    <Icon size={18} />
  </motion.a>
);

const FooterLink = ({ href, children }) => (
  <a href={href} className="block w-fit group">
    <motion.span
      className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-pink-400 transition-colors relative"
      whileHover={{ x: 5 }}
    >
      {children}
    </motion.span>
  </a>
);

/* ============================
   INTERACTIVE COMPONENTS
============================ */
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

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
      <div style={{ transform: "translateZ(40px)" }} className="h-full">
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
      <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
        {children}
      </span>
    </motion.button>
  );
};

/* ============================
   MAIN APP
============================ */
export default function App() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  
  // HERO TRANSFORMS
  const heroOpacity = useTransform(smooth, [0, 0.2], [1, 0]);
  const heroScale = useTransform(smooth, [0, 0.2], [1, 0.8]);
  const heroY = useTransform(smooth, [0, 0.2], [0, -100]);

  // FEATURE TRANSFORMS
  const featureOpacity = useTransform(smooth, [0.15, 0.35, 0.6], [0, 1, 0]);
  const featureY = useTransform(smooth, [0.15, 0.35], [100, 0]);
  const featureScale = useTransform(smooth, [0.15, 0.35], [0.9, 1]);

  // CAMPUS TRANSFORMS
  const campusX = useTransform(smooth, [0.4, 0.75], [200, 0]);
  const campusOpacity = useTransform(smooth, [0.4, 0.6, 0.8], [0, 1, 0]);

  // FINAL CTA TRANSFORMS
  const ctaScale = useTransform(smooth, [0.8, 1], [0.8, 1.2]);
  const ctaOpacity = useTransform(smooth, [0.75, 0.9], [0, 1]);

  return (
    <div className="relative min-h-[500vh] bg-neutral-950 text-white">
      
     

      {/* HERO SECTION */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="text-center max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 text-pink-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-8">
            <Sparkles size={10} /> Experience Connection in 3D
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-pink-300 mb-8 tracking-tighter leading-none">
            Matches that <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-pink-400 to-pink-500">
              Actually Click.
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Stop scrolling through flat profiles. Enter a living ecosystem where 
            personality has dimension and chemistry is measurable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <SpotlightButton className="text-lg px-16 py-6 border-pink-600 !bg-pink-600/10">
              Start Your Vibe Check
            </SpotlightButton>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Scroll to fly</span>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6">
        <motion.div 
          style={{ opacity: featureOpacity, y: featureY, scale: featureScale }}
          className="max-w-6xl w-full"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">Multi-Dimensional Dating</h2>
            <p className="text-pink-500/60 uppercase tracking-widest text-xs font-bold">How the Vibe ID works</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TiltCard className="h-[400px] rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-end group overflow-hidden">
              <div className="absolute top-10 right-10 w-20 h-20 bg-pink-500/10 blur-3xl group-hover:bg-pink-500/20 transition-all" />
              <Fingerprint className="text-pink-400 mb-6" size={48} strokeWidth={1} />
              <h3 className="text-2xl font-bold text-white mb-3">Vibe ID™</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your personality isn't a bio. It's a frequency. We map your humor, music, and values into a unique 3D signature.
              </p>
            </TiltCard>

            <TiltCard className="h-[400px] rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-end group overflow-hidden md:-translate-y-12">
              <div className="absolute top-10 right-10 w-20 h-20 bg-pink-600/10 blur-3xl group-hover:bg-pink-600/20 transition-all" />
              <ShieldCheck className="text-pink-300 mb-6" size={48} strokeWidth={1} />
              <h3 className="text-2xl font-bold text-white mb-3">Safe Space</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Biometric verification at entry. No bots, no catfishes—just actual people looking for actual chemistry.
              </p>
            </TiltCard>

            <TiltCard className="h-[400px] rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-end group overflow-hidden">
              <div className="absolute top-10 right-10 w-20 h-20 bg-pink-400/10 blur-3xl group-hover:bg-pink-400/20 transition-all" />
              <MessageSquare className="text-pink-400 mb-6" size={48} strokeWidth={1} />
              <h3 className="text-2xl font-bold text-white mb-3">Organic Flow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Skip the small talk. Our ice-breakers are powered by your shared Vibe ID, making the first message effortless.
              </p>
            </TiltCard>
          </div>
        </motion.div>
      </section>

      {/* CAMPUS SECTION */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6 pointer-events-none">
        <motion.div 
          style={{ x: campusX, opacity: campusOpacity }}
          className="max-w-4xl w-full text-right"
        >
          <div className="flex justify-end mb-8">
            <div className="w-20 h-20 bg-pink-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-pink-500/20">
              <GraduationCap size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
            Verified <br /> Campus <br /> Circles
          </h2>
          <p className="text-slate-400 text-lg max-w-lg ml-auto mb-8 font-light">
            Exclusive spaces for university students. Verify your .edu and match within your campus bubble or explore global vibes.
          </p>
          <div className="flex justify-end gap-3 flex-wrap">
            {["NYU", "UCLA", "Stanford", "MIT", "Oxford"].map((s) => (
              <span key={s} className="px-4 py-2 rounded-full border border-pink-500/20 bg-pink-500/5 text-[10px] font-bold text-pink-300/60">{s}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6">
        <motion.div 
          style={{ scale: ctaScale, opacity: ctaOpacity }}
          className="text-center relative"
        >
          <div className="absolute inset-0 bg-pink-600/10 blur-[120px] rounded-full pointer-events-none" />
          <h2 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase leading-none relative">
            Find Your <br /> Frequency
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative">
            <SpotlightButton className="text-lg px-16 py-6 border-pink-500/40 !bg-pink-500/10">
              Start Your Vibe Check
            </SpotlightButton>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold max-w-[150px] leading-loose">
              Join 2 million others finding real chemistry.
            </p>
          </div>
        </motion.div>
      </section>

     <Footer />
    </div>
  );
}