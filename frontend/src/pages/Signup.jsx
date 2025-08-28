'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;


const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [step, setStep] = useState('signup'); // signup → otp
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  // STEP 1: Request OTP
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
     const response = await fetch(`${API_URL}/api/auth/send-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: formData.email }),
});


      if (response.ok) {
        alert('✅ OTP sent to your email!');
        setStep('otp'); // move to OTP screen
      } else {
        const data = await response.json();
        alert('⚠️ ' + (data.message || 'Error sending OTP'));
      }
    } catch (err) {
      console.error('❌ Error sending OTP:', err);
      alert('❌ Failed to connect to server');
    }
  };

  // STEP 2: Verify OTP & Create Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...formData, otp }),
});


      if (response.ok) {
        alert('🎉 Account created successfully!');
        navigate('/login');
      } else {
        const data = await response.json();
        alert('⚠️ ' + (data.message || 'Invalid OTP or registration error'));
      }
    } catch (err) {
      console.error('❌ Error verifying OTP:', err);
      alert('❌ Failed to connect to server');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
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

      <div className="relative z-10 w-full h-full flex items-end justify-center px-4 pb-10">
        {step === 'signup' ? (
          // SIGNUP FORM
          <form
            onSubmit={handleSignup}
            className="backdrop-blur-md border-2 border-black rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">Sign Up</h2>

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 mb-3 bg-white border-2 border-black rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 mb-3 bg-white border-2 border-black rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 mb-4 bg-white border-2 border-black rounded"
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 transition font-medium backdrop-blur-sm"
            >
              Get OTP
            </motion.button>
          </form>
        ) : (
          // OTP VERIFICATION FORM
          <form
            onSubmit={handleVerifyOtp}
            className="backdrop-blur-md border-2 border-black rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-center mb-4 border-b-2 border-black pb-2">Verify OTP</h2>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mb-4 bg-white border-2 border-black rounded"
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full px-4 py-2 rounded-xl text-pink-600 hover:bg-pink-100 transition font-medium backdrop-blur-sm"
            >
              Verify & Register
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
