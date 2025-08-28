'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ViewProfile() {
  const { userId } = useParams(); // ✅ correct param name
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/user/${userId}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

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
  }, [userId]);

  const imageURL = (filename) =>
    filename ? `http://localhost:5000/uploads/${filename}` : '/default-avatar.png';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading profile...
      </div>
    );
  }

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
    <section className="min-h-screen bg-white py-10 px-6 flex justify-center items-start">
      <div className="max-w-2xl w-full bg-pink-50 rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-3xl font-bold text-pink-600 text-center">
          {profile.name}'s Profile
        </h2>

        {profile.profilePic && (
          <img
            src={imageURL(profile.profilePic)}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
        )}

        <div className="text-lg space-y-2">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Gender:</strong> {profile.gender}</p>
          <p><strong>Interested In:</strong> {profile.preference}</p>
          <p><strong>Location:</strong> {profile.location}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <p><strong>Interests:</strong> {profile.interests?.join(', ') || 'None'}</p>

          {profile.morePics?.length > 0 && (
            <div>
              <strong>More Photos:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.morePics.map((pic, idx) => (
                  <img
                    key={idx}
                    src={imageURL(pic)}
                    alt={`Pic ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-6 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
      </div>
    </section>
  );
}
