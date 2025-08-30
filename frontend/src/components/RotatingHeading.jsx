'use client';

import React from 'react';
import RotatingText from './RotatingText';

export default function RotatingHeading() {
  return (
    <div className="flex items-center justify-center w-full bg-green-500 text-center">
      <RotatingText
        texts={[
          'Find Your Connection',
          'Vibe. Match. Enjoy.',
          'Life Awaits 💘',
          'AMORA Hai Na!',
        ]}
        mainClassName="text-5xl md:text-6xl font-bold animate-fade-in-up glowing-text"
        staggerFrom="center"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-120%", opacity: 0 }}
        staggerDuration={0.03}
        splitLevelClassName="overflow-hidden pb-1"
        elementLevelClassName=""
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        rotationInterval={2500}
      />

      {/* Glow style */}
      <style jsx>{`
        .glowing-text {
          text-shadow: 
            0 0 5px #0ef394ff,
            0 0 10px #3617e9ff,
            0 0 15px #0df12fff,
           
            0 0 20px rgba(216, 226, 15, 0.9);
        }
      `}</style>
    </div>
  );
}
