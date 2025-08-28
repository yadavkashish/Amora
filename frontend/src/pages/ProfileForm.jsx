'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

      // append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'interests') {
          // split into array for backend
          value
            .split(',')
            .map((i) => i.trim())
            .filter((i) => i.length > 0)
            .forEach((i) => data.append('interests', i));
        } else {
          data.append(key, value);
        }
      });

      // append files
      if (profilePicFile) data.append('profilePic', profilePicFile);
      if (morePicsFiles.length > 0) {
        morePicsFiles.forEach((file) => data.append('morePics', file));
      }

      const res = await fetch('http://localhost:5000/api/profile/create', {
        method: 'POST',
        body: data,
        credentials: 'include', // keep cookies if needed
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
    <section className="min-h-screen bg-white py-10 px-6 flex justify-center items-start">
      <div className="max-w-2xl w-full bg-pink-50 rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-3xl font-bold text-pink-600 text-center">
          Create Your Dating Profile
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block font-semibold">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block font-semibold">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-semibold">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block font-semibold">Branch</label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block font-semibold">Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MBA">MBA</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block font-semibold">Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Preference */}
          {/* Preference */}
<div>
  <label className="block font-semibold">Interested In</label>
  <select
    name="preference"
    value={formData.preference}
    onChange={handleChange}
    required
    className="w-full border p-2 rounded-lg"
  >
    <option value="">Select Preference</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
    <option value="Any">Any</option>
  </select>
</div>

          {/* Location */}
          <div>
            <label className="block font-semibold">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-semibold">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block font-semibold">Interests (comma separated)</label>
            <input
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* Profile Pic Upload */}
          <div>
            <label className="block font-semibold">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => handleFileChange(e, 'profilePic')}
            />
          </div>

          {/* More Pics Upload */}
          <div>
            <label className="block font-semibold">More Pictures</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'morePics')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg"
          >
            {loading ? 'Submitting...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </section>
  );
}
