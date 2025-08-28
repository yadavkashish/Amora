 import React from 'react';
import { FaInstagram, FaTwitter, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white/10 backdrop-blur-md text-pink-600 px-6 py-10 mt-20">
      <p>&copy; 2025 PataLo. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
    </footer>
  );
}
