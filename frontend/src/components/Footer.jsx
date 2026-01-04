import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Github, 
  ArrowRight,
  Heart,
  Mail
} from "lucide-react";

const SocialButton = ({ icon: Icon, href }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3 }}
    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-300"
  >
    <Icon size={18} />
  </motion.a>
);

const FooterLink = ({ to, children }) => (
  <Link to={to} className="block w-fit group">
    <motion.span
      className="text-zinc-500 text-sm font-medium group-hover:text-pink-400 transition-colors relative"
      whileHover={{ x: 5 }}
    >
      {children}
    </motion.span>
  </Link>
);

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-10 overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-xl">
      
      {/* Top decorative glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* COLUMN 1: BRANDING */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-pink-500 to-pink-700 rounded-lg">
                <Heart size={16} fill="white" className="text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
                Actual Chemistry
              </h2>
            </Link>
            
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Stop swiping on faces. Start connecting with frequencies. We use AI and 3D mapping to help you find the chemistry that actually clicks.
            </p>

            <div className="flex gap-4">
              <SocialButton icon={Instagram} href="#" />
              <SocialButton icon={Twitter} href="#" />
              <SocialButton icon={Linkedin} href="#" />
              <SocialButton icon={Github} href="#" />
            </div>
          </div>

          {/* COLUMN 2: DISCOVER */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-white font-bold text-[10px] uppercase tracking-[0.2em]">Discover</h3>
            <div className="space-y-3">
              <FooterLink to="/about">Our Story</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/blog">Vibe Blog</FooterLink>
              <FooterLink to="/security">Safety Center</FooterLink>
            </div>
          </div>

          {/* COLUMN 3: LEGAL */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-white font-bold text-[10px] uppercase tracking-[0.2em]">Legal</h3>
            <div className="space-y-3">
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/cookies">Cookie Policy</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
            </div>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="text-white font-bold text-[10px] uppercase tracking-[0.2em]">Stay in the loop</h3>
            <p className="text-zinc-500 text-sm">
              Get dating tips, success stories, and app updates sent to your inbox.
            </p>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="Vibe ID email..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-pink-600 text-white hover:bg-pink-500 transition-all">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Spaced Connections Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            <span>Crafted with</span>
            <Heart size={12} className="text-pink-500 fill-pink-500 animate-pulse" />
            <span>for the next generation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}