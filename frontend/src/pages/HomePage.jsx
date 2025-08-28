'use client';

import React from 'react';
import Lanyard from '../components/Lanyard';
import RotatingHeading from '../components/RotatingHeading';
// import Bg from '../components/Bg';

export default function HomePage() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden"
     style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      {/* 🔮 Animated Background */}
      {/* <Bg /> */}

      {/* 🌑 Dark overlay */}
     {/* 🌑 Dark overlay with z-index and opacity */}
<div className="absolute inset-0  z-10" />


      {/* 💘 Hero Section */}
      <section className="relative z-20 w-full h-screen flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-start px-8 md:px-16 text-white z-30">
          <RotatingHeading />
          <p className="mt-4 text-lg md:text-xl max-w-md animate-fade-in-up delay-200">
            Join AMORA— Where stories begin, and sparks fly.
          </p>
          <a
            href="/signup"
            className="mt-6 bg-pink-600 hover:bg-pink-500 transition px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg hover:scale-105 animate-fade-in-up delay-400"
          >
            Get Started
          </a>
        </div>

        <div className="w-full md:w-1/2 h-full">
          <Lanyard />
        </div>
      </section>

      {/* 💡 Features Section */}
      <section className="w-full relative z-20 py-20 ">
        <div className="absolute w-full h-full top-0 left-0 z-0 heart-background animate-floating-hearts" />
        <div className="relative z-10 text-center space-y-6 px-4">
          <h2 className="text-4xl font-bold text-pink-700">Why AMORA?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
            <FeatureCard
              img="https://cdn.dribbble.com/users/1894420/screenshots/14081986/dating_app.gif"
              title="Smart Matching"
              desc="Get matched based on interests, values & emotional intelligence."
            />
            <FeatureCard
              img="https://cdn-icons-gif.flaticon.com/14112/14112996.gif"
              title="Private Chat"
              desc="Safe and fun chat with your matches. Love begins with a hi!"
            />
            <FeatureCard
              img="https://www.actualidadiphone.com/wp-content/uploads/2018/07/App-store.gif"
              title="Flirt Freely"
              desc="Break the ice with emoji reactions and fun flirting games."
            />
          </div>
        </div>
      </section>

      {/* 🚀 How It Works */}
      <section className="py-16  text-center relative px-4 z-20">
        <h2 className="text-3xl font-bold text-pink-700 mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create Your Profile', desc: 'Tell us about yourself and what you’re looking for.' },
            { step: '2', title: 'Set Preferences', desc: 'Answer compatibility questions to help us match you better.' },
            { step: '3', title: 'Start Connecting', desc: 'View profiles, match, chat & maybe meet your person!' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="p-6 bg-pink-50 rounded-2xl shadow hover:scale-105 transition">
              <div className="text-4xl font-bold text-rose-500 mb-4">{step}</div>
              <h3 className="text-xl font-semibold text-pink-700">{title}</h3>
              <p className="mt-2 text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ❤️ Testimonials */}
      <section className=" py-20 text-center relative z-20">
        <h2 className="text-3xl font-bold text-pink-800">Real Love Stories</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 px-4">
          {[
            { name: "Anjali & Rohan", feedback: "We matched in our first week and now we're engaged!" },
            { name: "Sam & Raj", feedback: "Finally found someone who truly gets me." },
            { name: "Neha & Arjun", feedback: "The emotional intelligence test actually worked!" },
          ].map(({ name, feedback }) => (
            <div key={name} className="bg-white p-6 rounded-xl shadow-md">
              <p className="italic text-gray-700">“{feedback}”</p>
              <p className="mt-4 font-semibold text-rose-600">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📱 App Preview */}
      <section className="py-20  text-center relative z-20">
        <h2 className="text-3xl font-bold text-pink-700 mb-10">Peek Inside the App</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3].map((i) => (
            <img
              key={i}
              src={`/screenshots/screen${i}.png`}
              alt={`App screen ${i}`}
              className="w-[250px] rounded-lg shadow-md"
            />
          ))}
        </div>
      </section>

      {/* ❓ FAQ */}
      <section className="py-16  relative z-20">
        <h2 className="text-3xl font-bold text-center text-pink-800 mb-10">FAQs</h2>
        <div className="max-w-4xl mx-auto space-y-6 px-6">
          {[
            { q: "Is PataLo free?", a: "Yes! You can start for free and explore premium features later." },
            { q: "How are matches made?", a: "We use your preferences, answers, and behavior to suggest best matches." },
            { q: "Is my data safe?", a: "Absolutely. We use end-to-end encryption and strict privacy policies." },
          ].map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-semibold text-pink-700">{q}</h3>
              <p className="text-gray-700">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📩 Final CTA */}
      <section className="w-full text-center py-16 relative z-20 text-white">
        <h2 className="text-3xl font-bold">Ready to Find Your Person?</h2>
        <a
          href="/signup"
          className="mt-6 inline-block bg-white text-pink-600 hover:scale-110 transition px-6 py-3 rounded-full font-semibold shadow-lg"
        >
          Join Now 💞
        </a>
      </section>

      
     
      <style>{`
        @keyframes floatHearts {
          0% { background-position: 0 0; }
          100% { background-position: 0 -1000px; }
        }
        .animate-floating-hearts {
          animation: floatHearts 60s linear infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out both;
        }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

// Reusable Feature Card
function FeatureCard({ img, title, desc }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transition transform hover:-translate-y-2 duration-300">
      <img src={img} className="w-full rounded-lg mb-4" alt={title} />
      <h3 className="text-xl font-semibold text-pink-600">{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
