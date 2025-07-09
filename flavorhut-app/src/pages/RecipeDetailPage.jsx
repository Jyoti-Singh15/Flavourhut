import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { recipeAPI, imageAPI, authAPI } from '../services/api';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    profilePictureUrl: user?.profilePictureUrl || ''
  });
  const [imagePreview, setImagePreview] = useState(user?.profilePictureUrl || '');

  useEffect(() => {
    if (user) {
      fetchUserRecipes();
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || ''
      });
      setImagePreview(user.profilePictureUrl || '');
    }
  }, [user]);

  const fetchUserRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await recipeAPI.getByUser(user._id);
      setUserRecipes(response.data);
    } catch (err) {
      console.error('Error fetching user recipes:', err);
      setError('Failed to load your recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        const response = await imageAPI.uploadProfile(formData);

        const image = response.data.image;
        setImagePreview(image);
        setFormData(prev => ({
          ...prev,
          profilePictureUrl: image
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await authAPI.updateProfile(formData);

      console.log('Profile update response:', response.data);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAddRecipe = () => {
    navigate('/add-recipe');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <BackButton className="mb-6" />
      {/* Banner Section with Background */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat mb-8 overflow-hidden rounded-3xl mx-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/blog-banner.webp')`,
          minHeight: '400px'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center min-h-[400px] px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">My Profile</h1>
            <p className="text-lg text-white">
              Manage your profile and view your culinary creations
            </p>
          </div>
        </div>
      </div>

      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleGoBack}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-white font-bold">
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary-accent text-white p-1 rounded-full cursor-pointer hover:bg-primary-accent/90 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username
                }
              </h2>
              <p className="text-gray-600">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-2">
                  Admin
                </span>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-gray-900">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <p className="text-gray-900">{user.bio || 'No bio added yet'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <p className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-primary-accent hover:bg-primary-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-accent hover:bg-primary-accent/90 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setImagePreview(user.profilePictureUrl || '');
                      setFormData({
                        username: user.username || '',
                        email: user.email || '',
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        bio: user.bio || '',
                        profilePictureUrl: user.profilePictureUrl || ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
              </div>

        {/* User's Recipes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">My Recipes</h3>
              <button
                onClick={handleAddRecipe}
                className="bg-primary-accent hover:bg-primary-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Add New Recipe
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent mx-auto mb-4"></div>
                <p>Loading your recipes...</p>
          </div>
            ) : userRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRecipes.map(recipe => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No recipes yet</h3>
                <p className="text-gray-500 mb-6">Start sharing your culinary creations!</p>
                <button
                  onClick={handleAddRecipe}
                  className="bg-primary-accent hover:bg-primary-accent/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Add Your First Recipe
                </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
