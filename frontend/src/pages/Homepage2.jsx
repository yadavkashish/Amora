import React, { useEffect, useRef, useState } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate 
} from "framer-motion";
import {
  Heart,
  Sparkles,
  Shield,
  Zap,
  MessageCircle,
  ArrowRight,
  Fingerprint,
  Ghost,
  Menu,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- MOCK HEADER (Since I don't have your Header component file) ---
const Header = ({ isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SoulSync</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Matches', 'Stories', 'Events'].map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:block text-sm font-medium text-white hover:text-pink-400 transition-colors">
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
          </button>
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- UTILITY COMPONENTS ---

// 1. Spotlight Button
function SpotlightButton({ children, onClick, className = "" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.button
      className={`relative group border border-white/20 bg-white/5 overflow-hidden rounded-full px-8 py-4 transition-colors hover:bg-white/10 ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              150px circle at ${mouseX}px ${mouseY}px,
              rgba(236, 72, 153, 0.3),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative flex items-center justify-center gap-2 font-semibold text-white">
        {children}
      </div>
    </motion.button>
  );
}

// 2. Animated Background Blob
const Blob = ({ className }) => (
  <motion.div 
    animate={{ 
      scale: [1, 1.2, 1], 
      rotate: [0, 90, 0],
      opacity: [0.3, 0.5, 0.3] 
    }}
    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    className={`absolute rounded-full blur-3xl mix-blend-screen filter ${className}`} 
  />
);

// 3. Infinite Marquee
const Marquee = ({ children, direction = 1 }) => {
  return (
    <div className="flex overflow-hidden relative z-0">
      <motion.div
        initial={{ x: direction > 0 ? -1000 : 0 }}
        animate={{ x: direction > 0 ? 0 : -1000 }}
        transition={{ ease: "linear", duration: 20, repeat: Infinity }}
        className="flex flex-shrink-0 gap-8 pr-8"
      >
        {children}
        {children} {/* Duplicate for seamless loop */}
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function HomePage() {
  // defined API_URL directly to avoid import.meta build issues in ES2015 environment
  const API_URL = "http://localhost:5000";
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Scroll Parallax Hooks
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-200 font-sans selection:bg-pink-500/30 overflow-x-hidden">
      <Header isLoggedIn={isLoggedIn} />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-20 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Blob className="w-[500px] h-[500px] bg-purple-600/30 -top-20 -left-20" />
          <Blob className="w-[400px] h-[400px] bg-pink-600/30 top-40 right-0 animation-delay-2000" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05050a]/50 to-[#05050a]"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
              <Sparkles size={12} />
              The Future of Connection
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white leading-[1.1] mb-8">
              Dating, but <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x">
                Actual Chemistry.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop swiping on faces. Start connecting with souls. Our AI analyzes 
              psychometric data to find matches that resonate on a deeper frequency.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SpotlightButton 
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/signup")}
                className="w-full sm:w-auto text-lg"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Your Journey"} <ArrowRight className="w-5 h-5" />
              </SpotlightButton>
              
              <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4">
                View Success Stories
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating 3D Cards Visual */}
        <motion.div 
          style={{ y: y1, rotateX: 20, rotate }}
          className="absolute -bottom-32 md:-bottom-48 left-0 right-0 flex justify-center gap-6 pointer-events-none opacity-50 md:opacity-80 blur-[2px]"
        >
           {[1, 2, 3].map((i) => (
             <div key={i} className={`w-48 h-72 md:w-64 md:h-96 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl shadow-2xl transform ${i === 2 ? '-translate-y-12 z-10' : 'translate-y-4'}`}></div>
           ))}
        </motion.div>
      </section>

      {/* --- STATS / SOCIAL PROOF --- */}
      <div className="py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Users", value: "2M+" },
            { label: "Matches Made", value: "850k" },
            { label: "Engagement", value: "18m" },
            { label: "Satisfaction", value: "4.9/5" }
          ].map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-zinc-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- FEATURES (BENTO GRID) --- */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Designed for <br /><span className="text-purple-400">Real Intimacy</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">
            
            {/* Feature 1 - Large Left */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 row-span-2 rounded-3xl overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 z-0"></div>
              <img src="https://images.unsplash.com/photo-1616004655123-818cbd4b3143?q=80&w=2070&auto=format&fit=crop" alt="Couple" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10 p-10 h-full flex flex-col justify-end bg-gradient-to-t from-black via-black/50 to-transparent">
                <Fingerprint className="w-12 h-12 text-pink-400 mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">Biometric Compatibility</h3>
                <p className="text-zinc-300 max-w-md">We go beyond interests. Our algorithm analyzes communication styles and emotional intelligence to predict lasting chemistry.</p>
              </div>
            </motion.div>

            {/* Feature 2 - Top Right */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Verified Humans Only</h3>
                <p className="text-sm text-zinc-400">Zero bots. Mandatory photo verification ensures you're talking to who you think you are.</p>
              </div>
            </motion.div>

            {/* Feature 3 - Bottom Right */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <Ghost className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Anti-Ghosting Protocol</h3>
                <p className="text-sm text-zinc-400">Our app gently nudges conversations and limits active matches to encourage focus.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- DYNAMIC TESTIMONIALS --- */}
      <section className="py-24 overflow-hidden bg-gradient-to-b from-transparent to-black">
        <h2 className="text-center text-3xl font-bold text-white mb-16">Vibes from the Community</h2>
        
        <Marquee direction={1}>
          {[1,2,3,4].map((i) => (
            <div key={i} className="w-[350px] p-6 rounded-2xl bg-zinc-900 border border-white/5 hover:border-pink-500/30 transition-colors">
              <div className="flex gap-1 text-yellow-500 mb-4">
                {[1,2,3,4,5].map(s => <Zap key={s} size={14} fill="currentColor" />)}
              </div>
              <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                "I was skeptical about the 'personality first' claim, but the first person I matched with... we just clicked instantly. It wasn't awkward small talk."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600"></div>
                <div>
                  <p className="text-white font-semibold text-sm">Alex D.</p>
                  <p className="text-zinc-500 text-xs">Matched 3 months ago</p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
        
        <div className="h-8"></div>

        <Marquee direction={-1}>
          {[1,2,3,4].map((i) => (
            <div key={i} className="w-[350px] p-6 rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/30 transition-colors">
               <div className="flex gap-1 text-yellow-500 mb-4">
                {[1,2,3,4,5].map(s => <Zap key={s} size={14} fill="currentColor" />)}
              </div>
              <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                "Finally a dating app that doesn't feel like a game. The UI is beautiful and the people seem genuinely interested in connection."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600"></div>
                <div>
                  <p className="text-white font-semibold text-sm">Jordan T.</p>
                  <p className="text-zinc-500 text-xs">Matched 1 month ago</p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Ready to stop <br /> searching?
          </h2>
          <div className="flex justify-center">
             <SpotlightButton 
                onClick={() => navigate("/signup")}
                className="text-xl px-10 py-5"
              >
                Find Your Person
              </SpotlightButton>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
            <span className="font-bold text-white">SoulSync</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Safety</a>
          </div>
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} SoulSync Inc.</p>
        </div>
      </footer>
    </div>
  );
}