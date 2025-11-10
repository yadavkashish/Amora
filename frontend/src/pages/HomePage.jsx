"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { useState } from "react";

// Main Component for the Home Page
export default function HomePage() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const API_URL = `${BASE_URL}` || "http://localhost:5000";
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <div className="min-h-screen font-sans">
      <style>{`
        :root{
          --page-bg: linear-gradient(180deg,#fffafc,#fbfbff);
          --card-bg: #ffffff;
          --fg: #081124;
          --muted: #6b7280;
          --primary: #7c3aed; /* purple */
          --accent: #ff3cac;  /* pink */
          --cyan: #06b6d4;    /* cyan */
          --glass: rgba(255,255,255,0.7);
          --border: rgba(2,6,23,0.06);
          --shadow-elegant: 0 12px 40px rgba(2,6,23,0.06);
        }

        body { background: var(--page-bg); color: var(--fg); }

        /* small helpers */
        .gradient-text {
          background: linear-gradient(90deg, var(--accent), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .cta-button-glow {
          box-shadow: 0 8px 30px rgba(124,58,237,0.12), 0 0 8px rgba(255,60,124,0.06);
        }

        /* hero */
        .hero-wrap { position: relative; padding-top: 5.5rem; padding-bottom: 4.5rem; overflow: hidden; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(124,58,237,0.03), transparent 40%); pointer-events: none; }

        /* cards */
        .feature-card, .testimonial-card, .card {
          background: var(--card-bg);
          border-radius: 1rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-elegant);
        }

        .feature-icon {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:56px;height:56px;border-radius:999px;
          background: linear-gradient(180deg, rgba(124,58,237,0.06), rgba(6,182,212,0.05));
        }

        .cta-primary {
          background: linear-gradient(90deg, var(--primary), var(--cyan));
          color: white;
          padding: 0.9rem 1.6rem;
          border-radius: 999px;
          font-weight: 800;
        }

        .cta-accent {
          background: linear-gradient(90deg, var(--accent), var(--primary));
          color: white;
          padding: 0.7rem 1.2rem;
          border-radius: 12px;
          font-weight: 700;
        }

        .muted { color: var(--muted); }
        .small { font-size: 0.95rem; }

        /* testimonial avatar */
        .t-avatar { width:48px;height:48px;border-radius:999px;border:2px solid rgba(124,58,237,0.12); }

        /* step bubble */
        .step-bubble { width:64px;height:64px;border-radius:999px;background:linear-gradient(180deg,var(--accent),var(--primary)); display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.25rem; }

        /* responsive container widths */
        .container { max-width:1100px;margin:0 auto;padding:0 1.25rem; }

        /* subtle decorative shapes */
        .decor-heart { opacity:0.08; position:absolute; left:8%; top:8%; transform:translate(-50%,-50%); filter: blur(1px); }
        .decor-star { opacity:0.06; position:absolute; right:10%; top:50%; transform:translateY(-50%); filter: blur(1px); }

        footer { background: transparent; border-top: 1px solid rgba(2,6,23,0.03); }
      `}</style>

      <Header />

      {/* Hero Section */}
      <main
        className="hero-wrap text-center relative"
        style={{ paddingTop: "7rem" }}
      >
        <div className="hero-overlay" />

        {/* decorative shapes (very subtle) */}
        <Heart className="decor-heart" size={220} color="#ffb6e6" />
        <Star className="decor-star" size={140} color="#ffd580" />

        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-extrabold mb-5"
            style={{ lineHeight: 1.02 }}
          >
            Find Your <span className="gradient-text">Perfect Match</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-3xl mx-auto small muted mb-8"
          >
            Join a friendly community built around personality-first matching.
            We help you connect with people who actually fit your values and
            vibe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginBottom: "1px" }} // ✅ ADDED GAP BELOW BUTTON
          >
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="cta-accent cta-button-glow"
              >
                Explore Matches ❤️
              </button>
            ) : (
              <button
                onClick={() => navigate("/signup")}
                className="cta-primary cta-button-glow"
              >
                Find Your Soulmate 💖
              </button>
            )}
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="w-6 h-6 text-pink-500" />}
              title="Advanced Matching"
              desc="Our AI connects you with people who match your personality and values."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
              title="Secure & Private"
              desc="End-to-end encrypted chats and profile verification for safer connections."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-blue-500" />}
              title="Thriving Community"
              desc="An active community increases your chances of finding a meaningful match."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white/60">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
            <Step
              number="1"
              title="Create Profile"
              desc="Sign up and build your personality-first profile."
            />
            <ArrowRight
              className="text-gray-300 rotate-90 md:rotate-0"
              size={28}
            />
            <Step
              number="2"
              title="Find Matches"
              desc="Browse or let our AI recommend compatible people."
            />
            <ArrowRight
              className="text-gray-300 rotate-90 md:rotate-0"
              size={28}
            />
            <Step
              number="3"
              title="Start Connecting"
              desc="Message, meet, and build something real."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">
            Loved by our community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I found the love of my life here — the matching system is thoughtful and accurate."
              author="Jessica L."
              avatar="https://randomuser.me/api/portraits/women/44.jpg"
            />
            <TestimonialCard
              quote="No more meaningless swipes. This app focuses on personality and values."
              author="Mark T."
              avatar="https://randomuser.me/api/portraits/men/32.jpg"
            />
            <TestimonialCard
              quote="I met someone special in a month. The community feels genuine."
              author="Sarah P."
              avatar="https://randomuser.me/api/portraits/women/65.jpg"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 mt-10">
        <div className="container text-center muted">
          <p>
            &copy; {new Date().getFullYear()} SoulSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="feature-card p-6 text-center"
    >
      <div className="feature-icon mx-auto mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="muted small">{desc}</p>
    </motion.div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="max-w-xs">
      <div className="step-bubble mb-4 mx-auto">{number}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="muted small">{desc}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, avatar }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="testimonial-card p-6"
    >
      <div className="flex items-center mb-3">
        <img src={avatar} alt={author} className="t-avatar mr-3" />
        <div>
          <div className="font-bold">{author}</div>
          <div className="flex text-yellow-400">
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
          </div>
        </div>
      </div>
      <p className="muted small italic">"{quote}"</p>
    </motion.div>
  );
}
