import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import LikeButton from './LikeButton';

function RecipeCard({ recipe }) {
  const recipeUrl = `/recipes/${recipe._id}`; // Use MongoDB _id

  return (
    <Link to={recipeUrl} className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 ease-in-out"
        />
        <LikeButton 
          recipeId={recipe._id} 
          initialLikes={recipe.likes || 0}
          onLikeChange={(likes, isLiked) => {
            // Update the recipe object if needed
            recipe.likes = likes;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-primary-accent transition-colors duration-200">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          By {recipe.userId?.username || 'Unknown Chef'}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <StarRating rating={recipe.averageRating || 0} size="sm" />
            <span className="text-sm text-gray-500 ml-2">
              ({recipe.ratingsCount || 0})
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {recipe.difficulty}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {recipe.prepTime} prep • {recipe.cookTime} cook • {recipe.servings} servings
        </p>
        {recipe.description && (
          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {recipe.mealType}
          </span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            {recipe.cuisine}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;