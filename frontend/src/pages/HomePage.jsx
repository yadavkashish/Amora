'use client';

import React, { useEffect, useState } from 'react';
import RotatingHeading from '../components/RotatingHeading';
import { motion } from "framer-motion";

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main
      className="relative w-full min-h-screen overflow-hidden bg-center bg-fixed md:bg-contain"
      style={{
        backgroundImage: !isMobile ? "url('/images/bg5.jpg')" : 'none',
        backgroundColor: isMobile ? '#ffe4e6' : 'transparent',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 z-10" />

      {/* Hero Section */}
      <section className="relative z-20 w-full min-h-screen flex flex-col md:flex-row items-center justify-center">
        {/* Left / Top */}
        <div className="w-full h-screen md:h-full flex flex-col justify-center items-center px-6 md:px-12 text-white z-30 text-center">
          <RotatingHeading />
          <p className="mt-4 bg-white text-base md:text-xl max-w-md animate-fade-in-up delay-200 text-black rounded px-2 py-1">
            Join Amora— Where stories begin, and sparks fly.
          </p>
          <a
            href="/signup"
            className="mt-6 bg-green-400 hover:bg-pink-500 transition px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg hover:scale-105 animate-fade-in-up delay-400"
          >
            Get Started
          </a>
        </div>

        {/* Right / Bottom */}
        <div className="w-full md:w-1/2 h-64 md:h-full mt-8 md:mt-0">
          {/* Lanyard or image component can go here */}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full relative z-20 py-20">
        <div className={`absolute w-full h-full top-0 left-0 z-0 heart-background animate-floating-hearts ${isMobile ? 'hidden' : 'block'}`} />
        <div className="relative z-10 text-center space-y-6 px-4">
          <span className="text-4xl font-bold text-pink-700 bg-white">Why AMORA?</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
            <FeatureCard
              img="https://cdn.dribbble.com/users/1894420/screenshots/14081986/dating_app.gif"
              title="Smart Compatibility"
              desc="Get Compatibility based on interests, values & emotional intelligence."
            />
            <FeatureCard
              img="https://cdn-icons-gif.flaticon.com/14112/14112996.gif"
              title="Private Chat"
              desc="Safe and fun chat with your Compatibility."
            />
            <FeatureCard
              img="https://www.actualidadiphone.com/wp-content/uploads/2018/07/App-store.gif"
              title="Explore Freely"
              desc="Break the ice of hesitation and explore what's around you."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 text-center relative px-4 z-20">
        <h2 className="text-3xl font-bold text-pink-700 mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Create Your Profile", desc: "Tell us about yourself." },
            { step: "2", title: "Set Preferences", desc: "Answer compatibility questions to help us match you better." },
            { step: "3", title: "Start Connecting", desc: "View profiles, compatibilities, & chat!" }
          ].map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-6 bg-black/40 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition text-white"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="text-4xl font-bold text-rose-400 mb-4"
              >
                {step}
              </motion.div>
              <h3 className="text-xl font-semibold text-pink-300">{title}</h3>
              <p className="mt-2 text-gray-200 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 relative z-20">
        <div className="absolute inset-0 z-0" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-white mb-10">FAQs</h2>
          <div className="max-w-4xl mx-auto space-y-6 px-6 text-white">
            {[
              { q: "Is Amora free?", a: "Yes! You can start for free and explore premium features later." },
              { q: "How are compatibilities calculated?", a: "We use your preferences, answers, and behavior to suggest best matches." },
              { q: "Is my data safe?", a: "Absolutely. We use end-to-end encryption and strict privacy policies." }
            ].map(({ q, a }) => (
              <div key={q} className="p-4 bg-black/60 backdrop-blur-md rounded-xl shadow-md">
                <h3 className="font-semibold text-pink-400">{q}</h3>
                <p className="text-gray-200">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full text-center py-16 relative z-20 text-white">
        <h2 className="text-3xl font-bold">Ready to Find Your Vibe?</h2>
        <a
          href="/signup"
          className="mt-6 inline-block bg-white text-pink-600 hover:scale-110 transition px-6 py-3 rounded-full font-semibold shadow-lg"
        >
          Join Now 💞
        </a>
      </section>

      {/* Custom styles */}
      <style>{`
        @keyframes floatHearts {
          0% { background-position: 0 0; }
          100% { background-position: 0 -1000px; }
        }
        .animate-floating-hearts {
          animation: floatHearts 60s linear infinite;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out both; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>
    </main>
  );
}

// Reusable Feature Card
function FeatureCard({ img, title, desc }) {
  return (
    <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl shadow-md transition transform hover:-translate-y-2 duration-300 text-white max-w-xs mx-auto">
      <img src={img} className="w-28 h-28 object-cover rounded-lg mb-3 mx-auto" alt={title} />
      <h3 className="text-lg font-semibold text-pink-400">{title}</h3>
      <p className="text-sm text-gray-200">{desc}</p>
    </div>
  );
}
