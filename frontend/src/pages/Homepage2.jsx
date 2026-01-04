import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Fingerprint,
  GraduationCap,
  Menu,
  X,
  Heart,
  Globe,
  Lock,
  MessageSquare,
  ShieldCheck
} from "lucide-react";

/**
 * LOCAL SETUP INSTRUCTIONS:
 * 1. Install dependencies: 
 * npm install three framer-motion lucide-react
 * 2. Ensure Tailwind CSS is installed and configured in your project.
 * 3. If using React 18, this component is optimized for Strict Mode.
 */

/* ============================
   THREE.JS BACKGROUND
============================ */
const ChemistryBackground = ({ scrollProgress }) => {
  const containerRef = useRef(null);
  const mountRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mountRef.current) return;
    mountRef.current = true; // Prevents double-init in React 18 Strict Mode

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Explicitly style the canvas for local consistency
    renderer.domElement.style.display = "block";
    containerRef.current.appendChild(renderer.domElement);

    const count = 6000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 15;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      color: "#ec4899",
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = scrollProgress.get();

      // Background behavior synced to scroll
      particles.rotation.y += 0.001 + p * 0.02;
      particles.rotation.x += 0.0005 + p * 0.01;
      particles.position.y = p * 4;
      camera.position.z = 5 - p * 4.5;

      // Color lerping
      if (p < 0.25) material.color.lerp(new THREE.Color("#ec4899"), 0.1);
      else if (p < 0.5) material.color.lerp(new THREE.Color("#a855f7"), 0.1);
      else if (p < 0.75) material.color.lerp(new THREE.Color("#6366f1"), 0.1);
      else material.color.lerp(new THREE.Color("#06b6d4"), 0.1);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgress]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 pointer-events-none" 
      style={{ backgroundColor: '#000', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
};

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
      className={`relative overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-sm transition-colors hover:border-white/40 ${className}`}
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
    <div className="relative min-h-[500vh] text-slate-200 selection:bg-pink-500/30" style={{ backgroundColor: '#000' }}>
      <ChemistryBackground scrollProgress={smooth} />

      {/* FIXED HEADER */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart size={16} fill="white" className="text-white" />
            </div>
            <span className="font-black text-sm tracking-tighter text-white uppercase">Actual Chemistry</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
            <a href="#" className="hover:text-white transition-colors">Vibe ID</a>
            <a href="#" className="hover:text-white transition-colors">Campus</a>
            <a href="#" className="hover:text-white transition-colors">Safety</a>
            <SpotlightButton className="!py-2 !px-6">Login</SpotlightButton>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="text-center max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/5 text-pink-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-8">
            <Sparkles size={10} /> Experience Connection in 3D
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none">
            Matches that <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500">
              Actually Click.
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Stop scrolling through flat profiles. Enter a living ecosystem where 
            personality has dimension and chemistry is measurable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SpotlightButton className="text-sm px-12 py-5 shadow-2xl shadow-pink-500/20">
              Enter the Cloud <ArrowRight size={14} />
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
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">How the Vibe ID works</p>
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
              <div className="absolute top-10 right-10 w-20 h-20 bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-all" />
              <ShieldCheck className="text-purple-400 mb-6" size={48} strokeWidth={1} />
              <h3 className="text-2xl font-bold text-white mb-3">Safe Space</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Biometric verification at entry. No bots, no catfishes—just actual people looking for actual chemistry.
              </p>
            </TiltCard>

            <TiltCard className="h-[400px] rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-end group overflow-hidden">
              <div className="absolute top-10 right-10 w-20 h-20 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all" />
              <MessageSquare className="text-indigo-400 mb-6" size={48} strokeWidth={1} />
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
            <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <GraduationCap size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
            Verified <br /> Campus <br /> Circles
          </h2>
          <p className="text-slate-500 text-lg max-w-lg ml-auto mb-8 font-light">
            Exclusive spaces for university students. Verify your .edu and match within your campus bubble or explore global vibes.
          </p>
          <div className="flex justify-end gap-3 flex-wrap">
            {["NYU", "UCLA", "Stanford", "MIT", "Oxford"].map((s) => (
              <span key={s} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/50">{s}</span>
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
          <div className="absolute inset-0 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
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

      {/* FOOTER */}
      <footer className="relative py-12 px-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center">
              <Heart size={12} fill="white" className="text-white" />
            </div>
            <span className="font-black text-xs text-white uppercase tracking-tighter">Actual Chemistry</span>
          </div>
          <div className="flex gap-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">© 2024 Spaced Connections Inc.</p>
        </div>
      </footer>
    </div>
  );
}