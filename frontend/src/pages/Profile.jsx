'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [morePicsFiles, setMorePicsFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profile/latest', {
          credentials: 'include',
        });
        const data = await res.json();
        setProfile(data);
        setFormData(data); // populate formData initially
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const imageURL = (filename) =>
    filename ? `http://localhost:5000/uploads/${filename}` : '';

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
    try {
      const data = new FormData();
      for (const key in formData) {
        if (Array.isArray(formData[key])) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      }
      if (profilePicFile) data.append('profilePic', profilePicFile);
      if (morePicsFiles.length > 0) morePicsFiles.forEach((file) => data.append('morePics', file));

      const res = await fetch(`http://localhost:5000/api/profile/${profile._id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Update failed');

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) {
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
  }

<section className="min-h-screen bg-gray-50 py-10 px-6 flex justify-center">
  <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-6 space-y-6">
    <div className="flex items-center space-x-6">
      <img
        src={imageURL(profile.profilePic)}
        alt="Profile"
        className="w-28 h-28 rounded-full object-cover shadow-md"
      />
      <div>
        <h2 className="text-3xl font-bold text-pink-600">{profile.name}</h2>
        <p className="text-gray-600">
          {profile.age} yrs • {profile.gender}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {profile.course}, {profile.branch}, Year {profile.year}
        </p>
      </div>
    </div>

    <div className="space-y-2">
      <p><strong>Location:</strong> {profile.location || 'Not specified'}</p>
      <p><strong>Interested In:</strong> {profile.preference}</p>
      <p><strong>Bio:</strong> {profile.bio || 'No bio yet'}</p>
      <p><strong>Interests:</strong> 
        {profile.interests?.length ? profile.interests.join(', ') : 'None'}
      </p>
    </div>

    {profile.morePics?.length > 0 && (
      <div>
        <strong className="block mb-2">Gallery</strong>
        <div className="grid grid-cols-3 gap-3">
          {profile.morePics.map((pic, idx) => (
            <img
              key={idx}
              src={imageURL(pic)}
              alt={`Pic ${idx + 1}`}
              className="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          ))}
        </div>
      </div>
    )}

    <button
      className="w-full mt-4 bg-pink-600 text-white py-2 rounded-xl font-semibold hover:bg-pink-700 transition"
      onClick={() => setIsEditing(true)}
    >
      Edit Profile
    </button>
  </div>
</section>

}
