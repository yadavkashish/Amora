import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";
import Terms from "./Terms"

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* LEFT: LEGAL LINKS */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
          <Link to="/terms" className="hover:text-pink-400 transition-colors">
            Terms and Conditions
          </Link>
          <Link to="/privacy" className="hover:text-pink-400 transition-colors">
            Privacy
          </Link>
          <Link to="/cookies" className="hover:text-pink-400 transition-colors">
            Cookies
          </Link>
          <Link to="/contact" className="hover:text-pink-400 transition-colors">
            Contact
          </Link>
           <Link to="/refund" className="hover:text-pink-400 transition-colors">
           Refund and Cancellation
          </Link>
        </div>

        {/* CENTER: COPYRIGHT */}
        <p className="text-[11px] text-zinc-600">
          © {new Date().getFullYear()} All rights reserved
        </p>

        {/* RIGHT: SOCIALS */}
        <div className="flex items-center gap-4 text-zinc-500">
          <a
            href="https://www.instagram.com/amoraonline_official"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors"
          >
            <Instagram size={16} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors"
          >
            <Linkedin size={16} />
          </a>
        </div>

      </div>
    </footer>
  );
}
