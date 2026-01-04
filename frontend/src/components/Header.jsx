"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles, LogOut, User, MessageCircle, LayoutDashboard } from "lucide-react";

/**
 * Glass Button Component (Mini version of the Home Page buttons)
 */
const GlassButton = ({ children, onClick, className = "", variant = "primary" }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 border
        ${variant === "primary" 
          ? "bg-white/10 hover:bg-white/20 border-white/10 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
          : "bg-transparent hover:bg-white/5 border-transparent hover:border-white/10 text-zinc-400 hover:text-white"}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Handle Scroll Effect for Navbar Background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check Auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(!!data.user);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [location.pathname, API_URL]);

  // Logout Logic
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setIsLoggedIn(false);
      navigate("/login");
      setMobileMenuOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /**
   * Navigation Links
   */
  const NavLinks = ({ isMobile = false }) => (
    <div className={`flex ${isMobile ? "flex-col gap-4" : "items-center gap-6"}`}>
      {!isLoggedIn ? (
        <>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
            <GlassButton variant="ghost" className={isMobile ? "w-full justify-start" : ""}>
              Login
            </GlassButton>
          </Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
            <GlassButton variant="ghost" className={isMobile ? "w-full justify-center" : ""}>
              Sign Up
            </GlassButton>
          </Link>
        </>
      ) : (
        <>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <GlassButton variant="ghost" className={`flex items-center gap-2 ${isMobile ? "w-full" : ""}`}>
              <LayoutDashboard size={16} /> Dashboard
            </GlassButton>
          </Link>
          
          <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
             <GlassButton variant="ghost" className={`flex items-center gap-2 ${isMobile ? "w-full" : ""}`}>
              <MessageCircle size={16} /> Chats
            </GlassButton>
          </Link>

          <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
             <GlassButton variant="ghost" className={`flex items-center gap-2 ${isMobile ? "w-full" : ""}`}>
              <User size={16} /> Profile
            </GlassButton>
          </Link>

          <GlassButton 
            onClick={handleLogout} 
            variant="ghost" 
            className={`text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 flex items-center gap-2 ${isMobile ? "w-full" : ""}`}
          >
            <LogOut size={16} /> Logout
          </GlassButton>
        </>
      )}
    </div>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#05030a]/80 backdrop-blur-xl border-white/10 py-3 shadow-lg shadow-purple-900/5"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-purple-200">
              AMORA
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <NavLinks />
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[80%] max-w-xs h-full bg-[#0a0a0c] border-l border-white/10 shadow-2xl z-50 flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-lg font-bold text-white">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <NavLinks isMobile={true} />

              {/* Decorative bottom element */}
              <div className="mt-auto pt-6 border-t border-white/5">
                <p className="text-xs text-center text-zinc-600">
                  Find your connection.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}