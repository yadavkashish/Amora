'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newMorePics, setNewMorePics] = useState([]);
  const [mediaPreview, setMediaPreview] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/latest`, {
        credentials: 'include',
      });
      const data = await res.json();
      setProfile(data);
      setFormData(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };
  fetchProfile();
}, []);

  const imageURL = (filename) =>
  filename ? `${API_URL}/uploads/${filename}` : '/default-avatar.png';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    if (type === 'profilePic') setNewProfilePic(e.target.files[0]);
    if (type === 'morePics') setNewMorePics([...newMorePics, ...Array.from(e.target.files)]);
  };

  const handleDeleteMorePic = (filename) => {
    setFormData({
      ...formData,
      morePics: formData.morePics.filter((pic) => pic !== filename),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === 'morePics') {
          formData.morePics.forEach((pic) => data.append('existingMorePics[]', pic));
        } else if (Array.isArray(formData[key])) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      }
      if (newProfilePic) data.append('profilePic', newProfilePic);
      if (newMorePics.length > 0) newMorePics.forEach((file) => data.append('morePics', file));

      const res = await fetch(`${API_URL}/api/profile/${profile._id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Update failed');

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      setNewProfilePic(null);
      setNewMorePics([]);
      setFormData(updatedProfile);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        No data found. Please{' '}
        <button
          className="ml-2 text-pink-600 underline"
          onClick={() => navigate('/profile-form')}
        >
          fill your profile
        </button>
        .
      </div>
    );

  return (
    <section className="min-h-screen relative flex pt-23 justify-center items-start py-10 px-6">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/bgvideos/bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      {/* Overlay */}
      <div className="absolute inset-0  z-0"></div>

      {/* Profile Card */}
      <div className="relative z-10 max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        {!isEditing ? (
          <>
            {/* Banner with profile pic */}
            <div className="h-40 bg-gradient-to-r from-pink-400 to-purple-400 relative">
              <img
                src={imageURL(profile.profilePic)}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover absolute left-1/2 -bottom-16 transform -translate-x-1/2 border-4 border-white shadow-lg cursor-pointer"
                onClick={() => setMediaPreview({ type: 'image', src: imageURL(profile.profilePic) })}
              />
            </div>

            {/* Info */}
            <div className="pt-20 pb-8 px-6 text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-500">{profile.location || 'Unknown Location'}</p>
              <p className="text-gray-600 italic">"{profile.bio || 'No bio yet'}"</p>

              <div className="flex flex-wrap justify-center gap-6 text-gray-700 text-lg">
                <p><strong>Age:</strong> {profile.age}</p>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <p><strong>Interested In:</strong> {profile.preference}</p>
              </div>

              {/* 🎓 College Info */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {profile.course && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full shadow-sm text-sm">
                    🎓 {profile.course}
                  </span>
                )}
                {profile.branch && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full shadow-sm text-sm">
                    🏫 {profile.branch}
                  </span>
                )}
                {profile.year && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full shadow-sm text-sm">
                    📅 Year {profile.year}
                  </span>
                )}
              </div>
            </div>

            {/* Interests */}
            {profile.interests?.length > 0 && (
              <div className="px-6 py-4 border-t">
                <h3 className="text-xl font-semibold text-pink-600 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm shadow-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {profile.morePics?.length > 0 && (
              <div className="px-6 py-6 border-t">
                <h3 className="text-xl font-semibold text-pink-600 mb-4">Gallery</h3>
                <div className="grid grid-cols-3 gap-3">
                  {profile.morePics.map((pic, idx) => (
                    <img
                      key={idx}
                      src={imageURL(pic)}
                      alt={`Pic ${idx + 1}`}
                      className="w-full h-28 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                      onClick={() => setMediaPreview({ type: 'image', src: imageURL(pic) })}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-6">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </>
        ) : (
          <form
            className="p-6 space-y-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-lg"
            onSubmit={handleSubmit}
          >
            {/* Profile Picture Edit */}
            <div className="flex justify-center relative mb-6">
              <img
                src={newProfilePic ? URL.createObjectURL(newProfilePic) : imageURL(profile.profilePic)}
                className="w-28 h-28 rounded-full object-cover border-4 border-pink-500"
              />
              <label className="absolute bottom-0 right-1 bg-pink-600 text-white p-2 rounded-full cursor-pointer shadow-lg">
                <FaPlus />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'profilePic')}
                />
              </label>
            </div>

            <input
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Name"
            />
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Age"
            />
            <input
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Gender"
            />
            <input
              name="preference"
              value={formData.preference || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Interested In"
            />
            <input
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Location"
            />
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Bio"
            />
            <input
              name="course"
              value={formData.course || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Course"
            />
            <input
              name="branch"
              value={formData.branch || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Branch"
            />
            <input
              name="year"
              value={formData.year || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Year"
            />
            <input
              name="interests"
              value={formData.interests?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interests: e.target.value.split(',').map((i) => i.trim()),
                })
              }
              className="w-full border p-2 rounded-lg"
              placeholder="Interests (comma separated)"
            />

            {/* More Pictures */}
            <div>
              <label className="block font-semibold mb-2">More Pictures</label>
              <div className="flex flex-wrap gap-3">
                {formData.morePics?.map((pic, idx) => (
                  <div key={idx} className="relative">
                    <img src={imageURL(pic)} className="w-24 h-24 rounded-lg object-cover" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      onClick={() => handleDeleteMorePic(pic)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {/* Plus icon for adding new */}
                <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-pink-400 rounded-lg cursor-pointer">
                  <FaPlus className="text-pink-600 text-xl" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'morePics')}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                💾 Save Changes
              </button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded-lg"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Fullscreen Media Modal */}
      {mediaPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setMediaPreview(null)}
        >
          <img
            src={mediaPreview.src}
            alt="Full view"
            className="max-h-[90%] max-w-[90%] object-contain rounded-lg shadow-lg"
          />
        </div>
      )}
    </section>
  );
}
