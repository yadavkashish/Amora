'use client';

import React from 'react';
import RotatingText from './RotatingText'; // Assumes you already have the RotatingText logic in this file

export default function RotatingHeading() {
  return (
    <RotatingText
      texts={[
        'Find Your ❤️ Match',
        'Swipe. Match. Date.',
        'Love Awaits 💘',
        'PataLo Hai Na!',
      ]}
      mainClassName="text-5xl md:text-6xl font-bold drop-shadow-lg animate-fade-in-up"
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
  );
}
