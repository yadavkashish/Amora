import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="relative text-pink-600 px-6 py-2 mt-10 backdrop-blur-md"
      style={{
        backgroundImage: "url('/images/bg5.jpg')", // your image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Optional overlay for blur/dark effect */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Footer content */}
      <div className="relative z-10 text-center text-sm">
        <p>&copy; 2025 PataLo. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-1">
          <Link to="/terms" className="hover:underline text-xs">Terms</Link>
          <Link to="/privacy" className="hover:underline text-xs">Privacy</Link>
          <Link to="/contact" className="hover:underline text-xs">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
