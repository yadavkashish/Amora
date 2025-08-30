'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
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
          data.append(key, value);
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

  return (
    <section className="min-h-screen pt-22 bg-gradient-to-br from-pink-100 via-white to-pink-50 flex justify-center items-center py-10 px-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-pink-100">
        <h2 className="text-3xl pt-3 font-extrabold text-pink-600 text-center">
          Create Your Profile
        </h2>
        <p className="text-center text-gray-500">Fill in your details !</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender & Preference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Interested In</label>
              <select
                name="preference"
                value={formData.preference}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="">Select Preference</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Any</option>
              </select>
            </div>
          </div>

          {/* Branch, Course, Year */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="">Branch</option>
                <option>CSE</option>
                <option>CSE-AIML</option>
                <option>CSE-AI</option>
                <option>CSIT</option>
                <option>CS</option>

                <option>IT</option>
                <option>ECE</option>
                <option>EEE</option>
                <option>ME</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Course</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="">Course</option>
                <option>B.Tech</option>
                <option>M.Tech</option>
                <option>MBA</option>
              </select>
            </div>
           {/* Year */}
<div>
  <label className="block text-sm font-semibold text-gray-700">Year</label>
  <select
    name="year"
    value={formData.year}
    onChange={handleChange}
    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
  >
    <option value="">Select Year</option>
    <option value="1">1st</option>
    <option value="2">2nd</option>
    <option value="3">3rd</option>
    <option value="4">4th</option>
  </select>
</div>

          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              rows="3"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Interests (comma separated)</label>
            <input
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
          </div>

          {/* Profile Pic */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => handleFileChange(e, 'profilePic')}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200"
            />
            {profilePicFile && (
              <img
                src={URL.createObjectURL(profilePicFile)}
                alt="Profile preview"
                className="mt-3 w-24 h-24 object-cover rounded-lg border"
              />
            )}
          </div>

          {/* More Pics */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">More Pictures</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'morePics')}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200"
            />
            {morePicsFiles.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {morePicsFiles.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt={`More preview ${i}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-70"
          >
            {loading ? 'Submitting...' : '✨ Create Profile'}
          </button>
        </form>
      </div>
    </section>
  );
}
