// Signup.jsx (client)
"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "", // <-- new
  });
  const [step, setStep] = useState("signup"); // signup → otp
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  // STEP 1: Request OTP
  const handleSignup = async (e) => {
    e.preventDefault();

    // optional client-side check for gender
    if (!formData.gender) {
      alert("Please select your gender.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        alert("✅ OTP sent to your email!");
        setStep("otp"); // move to OTP screen
      } else {
        const data = await response.json();
        alert("⚠️ " + (data.message || "Error sending OTP"));
      }
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      alert("❌ Failed to connect to server");
    }
  };

  // STEP 2: Verify OTP & Create Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      // send entire formData (including gender) along with otp
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Signup successful:", data);
        // show cookies for debugging (optional)
        console.log("🍪 Current cookies:", document.cookie.split(";").map(c => c.trim()));
        alert(data.message || "Registered successfully");
        navigate("/compatibilityform");
      } else {
        alert("⚠️ " + (data.error || "Invalid OTP or registration error"));
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      alert("❌ Failed to connect to server");
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
          style={{ pointerEvents: "auto" }}
        />
      </div>

      <div className="relative z-10 w-full h-full flex items-end justify-center px-4 pb-10">
        {step === "signup" ? (
          // SIGNUP FORM
          <form
            onSubmit={handleSignup}
            className="backdrop-blur-md border border-gray-900/10 rounded-xl shadow-lg p-6 w-full max-w-md bg-white/70"
          >
            <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
            <h4 className="font-medium text-center mb-4">Use your college email only</h4>

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 mb-3 bg-white border border-gray-200 rounded"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 mb-3 bg-white border border-gray-200 rounded"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 mb-3 bg-white border border-gray-200 rounded"
              required
              minLength={6}
            />

            {/* Gender select (new) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
                className="w-full p-2 bg-white border border-gray-200 rounded"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full px-4 py-2 rounded-xl text-white bg-pink-500 hover:bg-pink-600 transition font-medium"
            >
              Get OTP
            </motion.button>
          </form>
        ) : (
          // OTP VERIFICATION FORM
          <form
            onSubmit={handleVerifyOtp}
            className="backdrop-blur-md border border-gray-900/10 rounded-xl shadow-lg p-6 w-full max-w-md bg-white/70"
          >
            <h2 className="text-2xl font-bold text-center mb-4">Verify OTP</h2>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mb-4 bg-white border border-gray-200 rounded"
              required
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full px-4 py-2 rounded-xl text-white bg-pink-500 hover:bg-pink-600 transition font-medium"
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
