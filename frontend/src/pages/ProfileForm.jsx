'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, MapPin, BookOpen, Camera, Send, CheckCircle, Loader, Briefcase, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Framer Motion Variants for section entry
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 50, staggerChildren: 0.08 } 
  },
};

const inputItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Component for a styled input group
const InputGroup = ({ children, title, icon: Icon }) => (
  <motion.div 
    variants={inputItemVariants}
    className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100"
  >
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-pink-100 pb-2">
      <Icon className="w-6 h-6 text-pink-500" />
      {title}
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

export default function ProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    preference: '',
    location: '',
    interests: '',
    branch: '',
    course: '',
    year: '',
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [morePicsFiles, setMorePicsFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    if (type === 'profilePic') {
      setProfilePicFile(e.target.files[0]);
    } else if (type === 'morePics') {
      setMorePicsFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'interests') {
          value
            .split(',')
            .map((i) => i.trim())
            .filter((i) => i.length > 0)
            .forEach((i) => data.append('interests', i));
        } else {
          // Append values only if they are not empty strings or null
          if (value !== '' && value !== null) {
            data.append(key, value);
          }
        }
      });

      if (profilePicFile) data.append('profilePic', profilePicFile);
      if (morePicsFiles.length > 0) {
        morePicsFiles.forEach((file) => data.append('morePics', file));
      }

      const res = await fetch(`${API_URL}/api/profile/create`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Profile creation failed:", errData);
        alert(errData.error || "Error creating profile");
        return;
      }

      await res.json();
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert('Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  // --- UI Variables (Themed for Pink/White) ---
  const primaryColor = 'pink-600';
  const accentColor = 'pink-400';
  const bgColor = 'from-pink-50 via-white to-pink-100';
  const inputClass = `w-full border border-gray-300 rounded-xl p-3 focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all shadow-sm focus:outline-none bg-white`;
  const labelClass = "block text-sm font-bold text-gray-700 mb-1";
  const fileInputClass = `block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200 transition shadow-sm`;
  // ---------------------------------------------

  return (
    <section className={`min-h-screen pt-23 bg-gradient-to-br ${bgColor} flex justify-center items-start py-12 px-4 sm:px-6`}>
      <motion.div 
        className={`max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 border-t-8 border-${accentColor}`}
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <h2 className={`text-4xl font-extrabold text-${primaryColor} leading-tight`}>
            Create Your Profile
          </h2>
          <p className="mt-2 text-lg text-gray-500">
            Fill in your details to start connecting!
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Group 1: Personal Basics */}
          <InputGroup title="Personal Basics" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={inputItemVariants}>
                <label className={labelClass}>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Your Name"
                />
              </motion.div>
              <motion.div variants={inputItemVariants}>
                <label className={labelClass}>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Your Age"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={inputItemVariants}>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </motion.div>
              <motion.div variants={inputItemVariants}>
                <label className={labelClass}>Interested In</label>
                <select
                  name="preference"
                  value={formData.preference}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Preference</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Any</option>
                </select>
              </motion.div>
            </div>
            
            <motion.div variants={inputItemVariants}>
              <label className={labelClass}>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClass}
                placeholder="E.g., Muradnagar, Ghaziabad"
              />
            </motion.div>
          </InputGroup>

          {/* Group 2: Academic Details */}
          <InputGroup title="Academic Details" icon={BookOpen}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={inputItemVariants}>
                <label className={labelClass}>Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Course</option>
                  <option>B.Tech</option>
                  <option>M.Tech</option>
                  <option>MBA</option>
                  <option>B.Pharma</option>
                  <option>M.Pharma</option>
                  <option>B.Arch</option>
                </select>
              </motion.div>
              <motion.div variants={inputItemVariants}>
                <label className={labelClass}>Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Branch</option>
                  <option>CSE</option>
                  <option>CSE-AIML</option>
                  <option>CSE-AI</option>
                  <option>CSIT</option>
                  <option>IT</option>
                  <option>ECE</option>
                  <option>EEE</option>
                  <option>ME</option>
                  <option>Civil</option>
                </select>
              </motion.div>
              <motion.div variants={inputItemVariants}>
                <label className={labelClass}>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st</option>
                  <option value="2">2nd</option>
                  <option value="3">3rd</option>
                  <option value="4">4th</option>
                  <option value="5">5th</option>
                </select>
              </motion.div>
            </div>
          </InputGroup>

          {/* Group 3: Personality & Interests */}
          <InputGroup title="Your Vibe & Interests" icon={Heart}>
            <motion.div variants={inputItemVariants}>
              <label className={labelClass}>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={inputClass}
                rows="4"
                placeholder="Share a little about your passions, dreams, and what you look for in a connection..."
              />
            </motion.div>

            <motion.div variants={inputItemVariants}>
              <label className={labelClass}>Interests (comma separated)</label>
              <input
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className={inputClass}
                placeholder="E.g., coding, coffee, hiking, Marvel movies"
              />
            </motion.div>
          </InputGroup>

          {/* Group 4: Photos */}
          <InputGroup title="Add Photos" icon={Camera}>
            
            {/* Profile Pic */}
            <motion.div variants={inputItemVariants}>
              <label className={labelClass}>📷 **Primary Profile Picture** (Required)</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => handleFileChange(e, 'profilePic')}
                className={fileInputClass}
              />
              {profilePicFile && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
                  <img
                    src={URL.createObjectURL(profilePicFile)}
                    alt="Profile preview"
                    className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-md"
                  />
                  <span className='text-sm text-pink-700 font-medium flex items-center'><CheckCircle className='w-4 h-4 mr-1'/> Image Ready!</span>
                </div>
              )}
            </motion.div>

            {/* More Pics */}
            <motion.div variants={inputItemVariants}>
              <label className={labelClass}>🖼️ More Pictures (Optional, up to 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, 'morePics')}
                className={fileInputClass}
              />
              {morePicsFiles.length > 0 && (
                <div className="mt-3 flex gap-3 flex-wrap p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {morePicsFiles.map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      alt={`More preview ${i}`}
                      className="w-16 h-16 object-cover rounded-lg border border-white shadow-md"
                    />
                  ))}
                  <span className='text-xs font-medium text-gray-500 p-2 self-end'>{morePicsFiles.length} uploaded</span>
                </div>
              )}
            </motion.div>
          </InputGroup>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full bg-${primaryColor} text-white py-4 mt-6 rounded-xl text-lg font-extrabold hover:bg-pink-700 transition disabled:bg-gray-400 disabled:shadow-none shadow-xl shadow-pink-300/60 flex items-center justify-center gap-3`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            variants={inputItemVariants}
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-5 h-5" /> Submitting Profile...
              </>
            ) : (
              <>
                <Send className="w-5 h-5"/> Create Profile
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
      <style jsx>{`
        .shadow-2xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </section>
  );
}