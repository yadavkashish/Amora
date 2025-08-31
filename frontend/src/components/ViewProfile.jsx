'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * ViewProfile Component
 * Displays detailed user profile with banner, gallery, interests, and full-screen media preview.
 */
export default function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL; // Base API URL from .env

  /** Fetch profile data on component mount or when userId changes */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/profile/user/${userId}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId, API_URL]);

  /** Helper to generate image/video URLs */
  const mediaURL = (url) =>
    url ? url : '/default-avatar.png';


  /** Loading state */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading profile...
      </div>
    );
  }

  /** Error state */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <p className="text-xl">⚠️ Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  /** No profile found state */
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xl">
        No profile found.
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
        >
          Go Back
        </button>
      </div>
    );
  }

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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b z-0"></div>

      {/* Profile Card */}
      <div className="relative z-10 max-w-3xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">

        {/* Banner + Profile Picture */}
        <div className="h-40 bg-gradient-to-r from-pink-400 to-purple-400 relative">
          <img
            src={mediaURL(profile.profilePic)}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover absolute left-1/2 -bottom-16 transform -translate-x-1/2 border-4 border-white shadow-lg cursor-pointer"
            onClick={() => setMediaPreview({ type: 'image', src: mediaURL(profile.profilePic) })}
          />
        </div>

        {/* Profile Info */}
        <div className="pt-20 pb-8 px-6 text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
          <p className="text-gray-500">{profile.location || 'Unknown Location'}</p>
          <p className="text-gray-600 italic">"{profile.bio || 'No bio yet'}"</p>

          {/* Basic Info */}
          <div className="flex flex-wrap justify-center gap-6 text-gray-700 text-lg">
            <p><strong>Age:</strong> {profile.age}</p>
            <p><strong>Gender:</strong> {profile.gender}</p>
            <p><strong>Interested In:</strong> {profile.preference}</p>
          </div>

          {/* College / Course Info */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full shadow-sm text-sm">
              🎓 {profile.course}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full shadow-sm text-sm">
              🏫 {profile.branch}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full shadow-sm text-sm">
              📅 Year {profile.year}
            </span>
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
        {(profile.morePics?.length > 0 || profile.videos?.length > 0) && (
          <div className="px-6 py-6 border-t">
            <h3 className="text-xl font-semibold text-pink-600 mb-4">Gallery</h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.morePics?.map((pic, idx) => (
                <img
                  key={idx}
                  src={mediaURL(pic)}
                  alt={`Pic ${idx + 1}`}
                  className="w-full h-28 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                  onClick={() => setMediaPreview({ type: 'image', src: mediaURL(pic) })}
                />
              ))}
              {profile.videos?.map((vid, idx) => (
                <video
                  key={idx}
                  src={mediaURL(vid)}
                  className="w-full h-28 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                  onClick={() => setMediaPreview({ type: 'video', src: mediaURL(vid) })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {mediaPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setMediaPreview(null)}
        >
          {mediaPreview.type === 'image' ? (
            <img
              src={mediaPreview.src}
              alt="Full view"
              className="max-h-[90%] max-w-[90%] object-contain rounded-lg shadow-lg"
            />
          ) : (
            <video
              src={mediaPreview.src}
              controls
              autoPlay
              className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
            />
          )}
        </div>
      )}
    </section>
  );
}
