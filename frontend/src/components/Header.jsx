'use client';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check login status using /me route
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          credentials: 'include', // send cookies
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ Logged in user:", data.user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setIsLoggedIn(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-md shadow-sm">
      <Link to="/" className="flex items-center gap-3">
        <img
          src="https://cdn-icons-png.flaticon.com/512/14277/14277574.png"
          alt="LoveLink Logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-2xl font-bold text-pink-600 tracking-wide">AMORA</h1>
      </Link>

      <nav className="flex items-center gap-4">
        {/* 🔑 Show Login & Signup if not logged in */}
        {!isLoggedIn && (
          <>
            <Link to="/login">
              <motion.button className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100">
                Login
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button className="px-5 py-2 rounded-xl text-pink-600 hover:bg-pink-100">
                Sign Up
              </motion.button>
            </Link>
          </>
        )}

        {/* 🔑 Show Dashboard etc. if logged in */}
        {isLoggedIn && (
          <>
            <Link to="/dashboard">
              <motion.button className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100">
                Dashboard
              </motion.button>
            </Link>
            <Link to="/profile">
              <motion.button className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100">
                Profile
              </motion.button>
            </Link>
            <Link to="/chat">
              <motion.button className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100">
                Chats
              </motion.button>
            </Link>
            <motion.button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100"
            >
              Logout
            </motion.button>
          </>
        )}
      </nav>
    </header>
  );
}
