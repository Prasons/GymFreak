import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfile, updateProfile } from '../api/userApi';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
  FaBirthdayCake,
  FaEdit,
  FaSave,
  FaTimes,
  FaDumbbell,
  FaChartLine,
  FaCog,
  FaWeight,
  FaRulerVertical,
  FaHeartbeat
} from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // User data state
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    membership: 'Basic',
    joinDate: new Date().toISOString().split('T')[0],
    profileImage: null,
    height: '',
    weight: '',
    fitnessGoals: '',
    medicalConditions: '',
    status: 'active'
  });

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({
          ...prev,
          profileImage: file,
          previewImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getProfile();
        setUser(prev => ({
          ...prev,
          ...data,
          previewImage: data.profileImage || null
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      Object.keys(user).forEach(key => {
        if (key !== 'profileImage' && key !== 'previewImage') {
          formData.append(key, user[key]);
        }
      });
      
      if (user.profileImage instanceof File) {
        formData.append('profileImage', user.profileImage);
      }

      const updatedProfile = await updateProfile(formData);
      setUser(prev => ({
        ...prev,
        ...updatedProfile,
        previewImage: updatedProfile.profileImage || prev.previewImage
      }));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-neutral">Manage your personal information and settings</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-light rounded-lg hover:bg-accent/90 transition-colors mt-4 md:mt-0"
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col items-center">
                {/* Profile Image */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-neutral overflow-hidden border-4 border-accent">
                    {user.profileImage ? (
                      <img 
                        src={user.previewImage || user.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-5xl text-light" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-accent p-2 rounded-full cursor-pointer hover:bg-accent/90 transition-colors">
                      <FaEdit className="text-light" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                {/* User Basic Info */}
                <h2 className="text-xl font-bold text-center">{user.name}</h2>
                <p className="text-accent text-sm">{user.membership} Member</p>
                <p className="text-neutral text-sm mt-2">
                  Member since {formatDate(user.joinDate)}
                </p>

                {/* Quick Stats */}
                <div className="w-full mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral/10 rounded-lg">
                    <FaDumbbell className="text-2xl text-accent mx-auto mb-2" />
                    <p className="text-sm text-neutral">Workouts</p>
                    <p className="text-lg font-bold">24</p>
                  </div>
                  <div className="text-center p-3 bg-neutral/10 rounded-lg">
                    <FaHeartbeat className="text-2xl text-accent mx-auto mb-2" />
                    <p className="text-sm text-neutral">Streak</p>
                    <p className="text-lg font-bold">7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-secondary rounded-2xl p-6 shadow-lg">
              {/* Tabs */}
              <div className="flex border-b border-neutral mb-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-accent border-b-2 border-accent' : 'text-neutral hover:text-light'}`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-2 font-medium ${activeTab === 'activity' ? 'text-accent border-b-2 border-accent' : 'text-neutral hover:text-light'}`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-accent border-b-2 border-accent' : 'text-neutral hover:text-light'}`}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm text-neutral mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={user.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm text-neutral mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={user.email}
                          onChange={handleInputChange}
                          disabled={true}
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm text-neutral mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={user.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm text-neutral mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={user.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm text-neutral mb-2">Gender</label>
                        <select
                          name="gender"
                          value={user.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm text-neutral mb-2">Address</label>
                        <textarea
                          name="address"
                          value={user.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="3"
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Fitness Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Fitness Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Height */}
                      <div>
                        <label className="block text-sm text-neutral mb-2">Height (cm)</label>
                        <input
                          type="number"
                          name="height"
                          value={user.height}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        />
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-sm text-neutral mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          name="weight"
                          value={user.weight}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        />
                      </div>

                      {/* Fitness Goals */}
                      <div className="md:col-span-2">
                        <label className="block text-sm text-neutral mb-2">Fitness Goals</label>
                        <textarea
                          name="fitnessGoals"
                          value={user.fitnessGoals}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="3"
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        ></textarea>
                      </div>

                      {/* Medical Conditions */}
                      <div className="md:col-span-2">
                        <label className="block text-sm text-neutral mb-2">Medical Conditions</label>
                        <textarea
                          name="medicalConditions"
                          value={user.medicalConditions}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="3"
                          className="w-full bg-neutral/10 text-light p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                          placeholder="List any medical conditions or allergies..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-neutral text-neutral rounded-lg hover:text-light hover:border-light transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-accent text-light rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        <FaSave /> Save Changes
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  <p className="text-neutral">Activity tracking coming soon...</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
                  <p className="text-neutral">Account settings coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
