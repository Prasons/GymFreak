import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/userApi";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updatedProfile = await updateProfile({
        name: form.name,
        email: form.email,
      });
      setProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-8 bg-secondary rounded-md shadow">
      <h2 className="text-3xl font-bold mb-6">My Profile</h2>
      <div className="mb-4">
        <label className="block mb-1">Name:</label>
        {editMode ? (
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        ) : (
          <div>{profile.name}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Email:</label>
        {editMode ? (
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        ) : (
          <div>{profile.email}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Status:</label>
        <div>{profile.status}</div>
      </div>
      {success && <div className="text-green-500 mb-2">{success}</div>}
      {editMode ? (
        <>
          <button onClick={handleSave} className="btn btn-primary mr-2">Save</button>
          <button onClick={() => setEditMode(false)} className="btn btn-secondary">Cancel</button>
        </>
      ) : (
        <button onClick={() => setEditMode(true)} className="btn btn-accent">Edit</button>
      )}
    </div>
  );
};

export default Profile;
