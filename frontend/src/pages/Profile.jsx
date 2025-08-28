'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newMorePics, setNewMorePics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profile/latest', {
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
    filename ? `http://localhost:5000/uploads/${filename}` : '';

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
          // Append existing pictures
          formData.morePics.forEach((pic) => data.append('existingMorePics[]', pic));
        } else if (Array.isArray(formData[key])) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      }
      if (newProfilePic) data.append('profilePic', newProfilePic);
      if (newMorePics.length > 0) newMorePics.forEach((file) => data.append('morePics', file));

      const res = await fetch(`http://localhost:5000/api/profile/${profile._id}`, {
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
        <button className="ml-2 text-pink-600 underline" onClick={() => navigate('/profile-form')}>
          fill your profile
        </button>
        .
      </div>
    );

  return (
    <section className="min-h-screen bg-white py-10 px-6 flex justify-center items-start">
      <div className="max-w-2xl w-full bg-pink-50 rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-3xl font-bold text-pink-600 text-center">Your Dating Profile</h2>

        {!isEditing ? (
          <>
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
              className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
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
              name="interests"
              value={formData.interests?.join(', ') || ''}
              onChange={(e) =>
                setFormData({ ...formData, interests: e.target.value.split(',').map((i) => i.trim()) })
              }
              className="w-full border p-2 rounded-lg"
              placeholder="Interests (comma separated)"
            />

            {/* Profile Picture */}
            <div>
              <label className="block font-semibold">Profile Picture</label>
              {profile.profilePic && !newProfilePic && (
                <img src={imageURL(profile.profilePic)} className="w-24 h-24 rounded-full mb-2" />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePic')} />
            </div>

            {/* More Pictures */}
            <div>
              <label className="block font-semibold">More Pictures</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.morePics?.map((pic, idx) => (
                  <div key={idx} className="relative">
                    <img src={imageURL(pic)} className="w-24 h-24 rounded-lg" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      onClick={() => handleDeleteMorePic(pic)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'morePics')} />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-lg">
                Save Changes
              </button>
              <button type="button" className="bg-gray-300 px-4 py-2 rounded-lg" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
