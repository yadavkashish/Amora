'use client';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

 const handleLogout = async () => {
  try {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // ⬅️ important to include cookies
    });

    // Optional: clear any client-side state if needed
    localStorage.removeItem('token'); // if you still use it for anything

    // Redirect to login page
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
        <h1 className="text-2xl font-bold text-pink-600 tracking-wide">PataLo</h1>
      </Link>

      <nav className="flex items-center gap-4">
        <Link to="/dashboard">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 transition font-medium backdrop-blur-sm"
          >
            Dashboard
          </motion.button>
        </Link>

        <Link to="/profile">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 transition font-medium backdrop-blur-sm"
          >
            Profile
          </motion.button>
        </Link>

        <Link to="/chat">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 transition font-medium backdrop-blur-sm"
          >
            Chats
          </motion.button>
        </Link>

        {/* ✅ Logout Button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition font-semibold"
        >
          Logout
        </motion.button>

        <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 transition font-medium backdrop-blur-sm"
          >
            Login
          </motion.button>
        </Link>

        <Link to="/signup">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold shadow-md overflow-hidden"
          >
            <span className="z-10 relative">Sign Up</span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-pink-400 opacity-20 rounded-xl"
            ></motion.div>
          </motion.button>
        </Link>
      </nav>
    </header>
  );
}
