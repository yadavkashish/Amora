'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  // 🔹 Handle login
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    if (res.ok) {
      navigate('/dashboard'); // redirect to form page
    } else {
      const data = await res.json();
      alert(Object.values(data.errors || { error: data.error || 'Login failed' }).join('\n'));
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    alert('❌ Failed to connect to server');
  } finally {
    setLoading(false);
  }
};


  // 🔹 Request OTP for reset
  const handleForgot = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        alert('📩 OTP sent to your email!');
        setShowForgot(true);
      } else {
        alert('⚠️ Failed to send OTP. Check email and try again.');
      }
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      alert('❌ Server error');
    }
  };

  // 🔹 Reset password with OTP
  const handleReset = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp, newPassword }),
      });

      if (res.ok) {
        alert('✅ Password reset successful! Please login with your new password.');
        setShowForgot(false);
        setOtp('');
        setNewPassword('');
      } else {
        alert('⚠️ Failed to reset password. Invalid OTP or expired.');
      }
    } catch (err) {
      console.error('❌ Reset password error:', err);
      alert('❌ Server error');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed top-0 left-0 w-screen h-screen z-0">
        <iframe
          title="SVTFOE - BFFs"
          className="w-full h-full"
          src="https://sketchfab.com/models/4def28f4dde644f1acb51059394430af/embed?ui_theme=dark&autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0"
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          style={{ pointerEvents: 'auto' }}
        ></iframe>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full h-full flex items-end justify-center px-4 pb-10">
        {!showForgot ? (
          // 🔹 Login Form
          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-md border-2 border-black rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">
              Login
            </h2>

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 mb-3 bg-white border-2 border-black rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 mb-4 bg-white border-2 border-black rounded"
              required
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-xl font-medium backdrop-blur-sm transition ${
                loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'text-pink-600 hover:bg-pink-100'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>

            <button
              type="button"
              onClick={handleForgot}
              className="mt-3 text-sm text-blue-600 underline w-full text-center"
            >
              Forgot Password?
            </button>
          </form>
        ) : (
          // 🔹 Reset Password Form
          <div className="backdrop-blur-md border-2 border-black rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">
              Reset Password
            </h2>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mb-3 bg-white border-2 border-black rounded"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 mb-4 bg-white border-2 border-black rounded"
              required
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="w-full px-4 py-2 rounded-xl font-medium text-pink-600 hover:bg-pink-100 transition backdrop-blur-sm"
            >
              Reset Password
            </motion.button>

            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="mt-3 text-sm text-gray-600 underline w-full text-center"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
