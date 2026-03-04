"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  LogOut,
  User,
  MessageCircle,
  LayoutDashboard,
  Bell,
  Settings,
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import axios from "axios";
import { playNotificationSound } from "../utils/playSound";

/* ------------------------------------------------------------
   GLASS BUTTON
------------------------------------------------------------ */
const GlassButton = ({
  children,
  onClick,
  className = "",
  variant = "primary",
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 border
        ${
          variant === "primary"
            ? "bg-white/10 hover:bg-white/20 border-white/10 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]"
            : "bg-transparent hover:bg-white/5 border-transparent hover:border-white/10 text-zinc-400 hover:text-white"
        }
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

/* ------------------------------------------------------------
   HEADER
------------------------------------------------------------ */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "";


  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotif, setUnreadNotif] = useState(0);

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [muteSound, setMuteSound] = useState(
    localStorage.getItem("muteNotificationSound") === "true"
  );

  /* ------------------------------------------------------------
     LOAD UNREAD COUNT (with sound for new count)
  ------------------------------------------------------------ */
  const loadUnread = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications/unread/count`, { withCredentials: true })


      const count = res.data.count || 0;

      setUnreadNotif((prev) => {
        if (!muteSound && count > prev) {
          playNotificationSound();
        }
        return count;
      });
    } catch (err) {
      console.error("Unread notif fetch failed:", err);
    }
  };

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 10000);
    return () => clearInterval(interval);
  }, [muteSound]);

  /* ------------------------------------------------------------
     SOUND TOGGLE
  ------------------------------------------------------------ */
  const toggleNotificationSound = () => {
    const updated = !muteSound;
    setMuteSound(updated);
    localStorage.setItem("muteNotificationSound", updated);
  };

  /* ------------------------------------------------------------
     SCROLL EFFECT
  ------------------------------------------------------------ */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------------------------------------------------------
     CHECK AUTH STATUS
  ------------------------------------------------------------ */
 useEffect(() => {
  // Pages where we MUST NOT call /me
  const publicPages = ["/login", "/signup", "/account-deleted", "/forgot", "/reset-password"];

  if (publicPages.includes(location.pathname)) {
    setIsLoggedIn(false);  // avoid rendering logged-in UI
    return;
  }

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      // Retry for missing cookie
      if (res.status === 401 || res.status === 403) {
        setTimeout(checkAuth, 200);
        return;
      }

      // Only redirect if truly deleted AND user is NOT on login/signup
      if (res.status === 410) {
        navigate("/account-deleted");
        return;
      }

      if (!res.ok) {
        setIsLoggedIn(false);
        return;
      }

      const data = await res.json();
      setIsLoggedIn(!!data.user);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  checkAuth();
}, [location.pathname]);



  /* ------------------------------------------------------------
     LOGOUT
  ------------------------------------------------------------ */
  const handleLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    localStorage.clear();
    sessionStorage.clear();

    navigate("/login", { replace: true });
    window.location.reload();
  };

  /* ------------------------------------------------------------
     NAV LINKS
  ------------------------------------------------------------ */
  const NavLinks = ({ isMobile = false }) => (
    <div
      className={`flex ${isMobile ? "flex-col gap-4" : "items-center gap-6"}`}
    >
      {!isLoggedIn ? (
        <>
          <Link to="/login">
            <GlassButton variant="ghost">Login</GlassButton>
          </Link>
          <Link to="/signup">
            <GlassButton variant="ghost">Sign Up</GlassButton>
          </Link>
        </>
      ) : (
        <>
          <Link to="/dashboard">
            <GlassButton variant="ghost" className="flex items-center gap-2">
              <LayoutDashboard size={16} /> Dashboard
            </GlassButton>
          </Link>

          <Link to="/chat">
            <GlassButton variant="ghost" className="flex items-center gap-2">
              <MessageCircle size={16} /> Chats
            </GlassButton>
          </Link>

          <Link to="/profile">
            <GlassButton variant="ghost" className="flex items-center gap-2">
              <User size={16} /> Profile
            </GlassButton>
          </Link>

          {/* 🔔 Notifications Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 relative"
          >
            <div className="relative">
              <Bell size={20} className="text-zinc-300" />

              {unreadNotif > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-[10px] font-bold text-white w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadNotif}
                </span>
              )}
            </div>

            <span className="text-zinc-300 text-sm">Notifications</span>
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Menu size={22} className="text-zinc-300" />
          </button>
        </>
      )}
    </div>
  );

  /* ------------------------------------------------------------
     RETURN JSX
  ------------------------------------------------------------ */
  return (
    <>
      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#05030a]/80 backdrop-blur-xl border-white/10 py-3"
            : "py-5 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
              AMORA
            </h1>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden md:block">
            <NavLinks />
          </nav>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* NOTIFICATION DROPDOWN */}
        {showNotifications && (
          <NotificationsDropdown onClose={() => setShowNotifications(false)} />
        )}

        {/* MORE MENU */}
        {showMoreMenu && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
            <div className="w-72 bg-[#0d0b10] h-full border-l border-white/10 p-6 flex flex-col">
              <h2 className="text-xl font-semibold text-white mb-6">More</h2>

              <Link
                to="/settings"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-zinc-300"
              >
                <Settings size={18} />
                Settings
              </Link>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-zinc-300"
              >
                <LogOut size={18} />
                Logout
              </button>

              <div className="mt-auto">
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="w-full mt-4 py-2 text-center text-zinc-400 bg-white/5 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

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

              <NavLinks isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
