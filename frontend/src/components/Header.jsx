'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

/**
 * Header Component
 * 
 * Responsive navigation bar with login/logout functionality,
 * mobile drawer menu, and animated transitions.
 */
export default function Header() {
  const navigate = useNavigate();
  
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL; // Base API URL from .env

  /** Check user authentication status whenever route changes */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(!!data.user); // true if user exists
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [location.pathname, API_URL]);

  /** Logout the user */
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      setIsLoggedIn(false);
      navigate('/login'); // redirect to login page
      setMobileMenuOpen(false); // close mobile menu on logout
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  /** Render navigation links based on authentication state */
  const renderLinks = () => (
    <>
      {!isLoggedIn ? (
        <>
          <Link to="/login">
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 w-full text-left"
            >
              Login
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 w-full text-left"
            >
              Sign Up
            </motion.button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/dashboard">
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 w-full text-left"
            >
              Dashboard
            </motion.button>
          </Link>
          <Link to="/profile">
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 w-full text-left"
            >
              Profile
            </motion.button>
          </Link>
          <Link to="/chat">
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 w-full text-left"
            >
              Chats
            </motion.button>
          </Link>
          <motion.button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 w-full text-left"
          >
            Logout
          </motion.button>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/60 backdrop-blur-md shadow-md border-b border-pink-100">

      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src="https://cdn-icons-png.flaticon.com/512/14277/14277574.png"
          alt="Amora"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-2xl font-bold text-pink-600 tracking-wide">AMORA</h1>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-4">{renderLinks()}</nav>

      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden p-2 rounded-md bg-white/80 shadow-md z-50"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay behind drawer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sliding drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 right-0 w-64 h-screen bg-white shadow-lg z-50 flex flex-col p-6 gap-4 overflow-y-auto"
            >
              {renderLinks()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
