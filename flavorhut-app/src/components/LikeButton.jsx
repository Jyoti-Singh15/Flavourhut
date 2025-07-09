import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LikeButton = ({ recipeId, initialLikes = 0, initialIsLiked = false, onLikeChange }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipeId && isAuthenticated) {
      fetchLikeStatus();
    }
  }, [recipeId, isAuthenticated]);

  const fetchLikeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`http://localhost:5000/api/recipes/${recipeId}/like-status`, { headers });
      setLikes(response.data.likes);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(`http://localhost:5000/api/recipes/${recipeId}/like`, {}, { headers });

      setLikes(response.data.likes);
      setIsLiked(response.data.isLiked);
      
      // Call parent callback if provided
      if (onLikeChange) {
        onLikeChange(response.data.likes, response.data.isLiked);
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
        isLiked 
          ? 'bg-red-500 text-white shadow-lg' 
          : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white shadow-md'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
      title={isAuthenticated ? (isLiked ? 'Unlike recipe' : 'Like recipe') : 'Log in to like recipe'}
    >
      <div className="flex items-center gap-1">
        <svg 
          className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'} stroke-current stroke-2`} 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
          />
        </svg>
        <span className="text-sm font-semibold">{likes}</span>
      </div>
    </button>
  );
};

export default LikeButton; 