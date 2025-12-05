import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Fingerprint,
  GraduationCap, // Added for the College feature
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- UTILITY COMPONENTS ---

// 1. 3D Tilt Card
const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 2. Spotlight Button
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
      className={`relative group border border-white/10 bg-white/5 overflow-hidden rounded-full px-8 py-4 transition-all hover:bg-white/10 hover:scale-105 active:scale-95 ${className}`}
      onMouseMove={handleMouseMove}
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
      <div className="relative flex items-center justify-center gap-2 font-bold text-white text-base tracking-wide">
        {children}
      </div>
    </motion.button>
  );
}

// 3. Romantic Moving Background
const BackgroundGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 bg-[#05030a]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 0%, rgba(244, 63, 94, 0.18), transparent 55%),
          radial-gradient(circle at 90% 100%, rgba(168, 85, 247, 0.18), transparent 55%),
          radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.12), transparent 55%)
        `,
      }}
    />
    <div
      className="absolute inset-y-[-200px] left-1/2 w-[260px] -translate-x-1/2 opacity-40"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, transparent, rgba(251, 113, 133, 0.2), transparent)",
        filter: "blur(20px)",
      }}
    />
    <motion.div
      className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-pink-500/25 blur-[90px]"
      animate={{
        x: [0, 30, -20, 0],
        y: [0, 10, -10, 0],
        opacity: [0.55, 0.9, 0.7, 0.55],
      }}
      transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-40 -right-24 w-[380px] h-[380px] rounded-full bg-purple-500/25 blur-[90px]"
      animate={{
        x: [0, -20, 25, 0],
        y: [0, -10, 5, 0],
        opacity: [0.45, 0.8, 0.6, 0.45],
      }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: [0.18, 0.28, 0.18] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    >
       {/* Hearts reduced for brevity in snippet */}
       <div className="absolute top-24 left-[15%] text-pink-400/40 text-[10px]">♥</div>
    </motion.div>
    <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 120px 60px #05030a" }} />
    <div className="absolute inset-0 opacity-[0.18] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
  </div>
);

// 4. Infinite Marquee
const Marquee = ({ children, direction = 1 }) => {
  return (
    <div className="flex overflow-hidden relative z-0">
      <motion.div
        initial={{ x: direction > 0 ? -1000 : 0 }}
        animate={{ x: direction > 0 ? 0 : -1000 }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        className="flex flex-shrink-0 gap-6 pr-6"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function HomePage() {
  const API_URL = "http://localhost:5000";
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

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
    <div className="relative min-h-screen bg-[#05050a] text-slate-200 font-sans selection:bg-pink-500/30 overflow-x-hidden">
      
      <BackgroundGrid />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-16 overflow-hidden">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-300/90 text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <Sparkles size={10} />
              The Future of Connection
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6">
              Dating, but <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient-x">
                Actual Chemistry!
              </span>
            </h1>

            <p className="text-base md:text-xl text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed font-light">
              Stop swiping on faces. Start connecting with souls. <br/>
              <span className="text-slate-200 font-medium">
                Sign up with your <span className="text-pink-400">college email</span> to match exclusively on your campus
              </span>, or join the global community to find your vibe anywhere.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SpotlightButton
                onClick={() =>
                  navigate(isLoggedIn ? "/dashboard" : "/signup")
                }
                className="w-full sm:w-auto"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Your Journey"}{" "}
                <ArrowRight className="w-4 h-4" />
              </SpotlightButton>

              <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors underline decoration-zinc-800 underline-offset-4">
                View Success Stories
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating 3D Cards Visual */}
        <motion.div
          style={{ y: y1, rotateX: 20, rotate }}
          className="absolute -bottom-24 md:-bottom-32 left-0 right-0 flex justify-center gap-4 pointer-events-none opacity-60 blur-[1px]"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-32 h-48 md:w-48 md:h-72 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md shadow-2xl transform ${
                i === 2 ? "-translate-y-8 z-10" : "translate-y-2"
              }`}
            ></div>
          ))}
        </motion.div>
      </section>

      {/* --- STATS BAR --- */}
      <div className="py-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center md:justify-between gap-8 items-center text-center md:text-left">
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">
            Trending Campuses:
          </p>
          {["NYU", "UCLA", "Stanford", "MIT", "Oxford"].map((school, i) => (
            <span
              key={i}
              className="text-lg font-semibold text-white/70 hover:text-white transition-colors cursor-default"
            >
              {school}
            </span>
          ))}
        </div>
      </div>

      {/* --- FEATURES (3D TILT CARDS) --- */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              More than just <span className="text-pink-500 italic">swiping</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              We've redesigned the dating experience to focus on what actually
              matters: safety, community, and vibe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Vibe Check */}
            <TiltCard className="group h-[450px] rounded-3xl overflow-hidden bg-[#0a0508] border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1621784563330-caee0b138a00?auto=format&fit=crop&w=1000&q=80"
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                alt="Vibe Check"
              />
              <div className="relative z-20 p-8 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 backdrop-blur-md flex items-center justify-center mb-6 border border-pink-500/20">
                  <Fingerprint className="text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Vibe Check Algorithm
                </h3>
                <p className="text-white/60 leading-relaxed">
                  Our AI analyzes your music taste, humor, and values to predict
                  chemistry before you even say hello.
                </p>
              </div>
            </TiltCard>

            {/* Card 2: Real People (Center) */}
            <TiltCard className="group h-[450px] rounded-3xl overflow-hidden bg-[#0a0508] border border-white/10 md:-mt-12">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=1000&q=80"
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                alt="Verification"
              />
              <div className="relative z-20 p-8 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 backdrop-blur-md flex items-center justify-center mb-6 border border-purple-500/20">
                  <Shield className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Real People Only
                </h3>
                <p className="text-white/60 leading-relaxed">
                  Mandatory video verification means no catfishes. Just real,
                  authentic people looking for connection.
                </p>
              </div>
            </TiltCard>

            {/* Card 3: Campus Mode (New Feature) */}
            <TiltCard className="group h-[450px] rounded-3xl overflow-hidden bg-[#0a0508] border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80"
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                alt="University Life"
              />
              <div className="relative z-20 p-8 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 backdrop-blur-md flex items-center justify-center mb-6 border border-blue-500/20">
                  <GraduationCap className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Campus Circle
                </h3>
                <p className="text-white/60 leading-relaxed">
                  Have a .edu email? Set your profile to <span className="text-white font-medium">Private Mode</span> to 
                  match exclusively with students from your own college campus.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* --- DYNAMIC TESTIMONIALS --- */}
      <section className="py-24 overflow-hidden bg-gradient-to-b from-transparent to-black">
        <h2 className="text-center text-3xl font-bold text-white mb-16">
          Vibes from the Community
        </h2>
        {/* Marquee code remains same as original, omitted for brevity if you want to keep it short, else paste original Marquee content here */}
        <Marquee direction={1}>
           {/* ... existing marquee items ... */}
             {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[350px] p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-white/5 hover:border-pink-500/30 transition-colors"
            >
              <div className="flex gap-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Zap key={s} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                "I was skeptical about the 'personality first' claim, but the
                first person I matched with... we just clicked instantly."
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
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/10 to-transparent pointer-events-none"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10 px-6">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to find <br /> your person?
          </h2>
          <div className="flex justify-center">
            <SpotlightButton
              onClick={() => navigate("/signup")}
              className="text-lg px-10 py-5"
            >
              Join Your Campus
            </SpotlightButton>
          </div>
        </div>
      </section>
    </div>
  );
}