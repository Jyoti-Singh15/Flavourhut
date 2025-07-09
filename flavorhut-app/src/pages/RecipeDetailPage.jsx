import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import LikeButton from '../components/LikeButton';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import BackButton from '../components/BackButton';

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [noChangesMessage, setNoChangesMessage] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
    setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/recipes/${id}`);
        setRecipe(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          prepTime: response.data.prepTime,
          cookTime: response.data.cookTime,
          servings: response.data.servings,
          difficulty: response.data.difficulty,
          mealType: response.data.mealType,
          cuisine: response.data.cuisine,
          dishType: response.data.dishType,
          occasion: response.data.occasion,
          ingredients: response.data.ingredients.map(ing => ing.item).join('\n'),
          instructions: response.data.instructions.map(inst => inst.step).join('\n'),
          notes: response.data.notes || '',
          image: response.data.image
        });
        setError('');
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again.');
      } finally {
      setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original recipe
    setFormData({
      title: recipe.title,
      description: recipe.description,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      mealType: recipe.mealType,
      cuisine: recipe.cuisine,
      dishType: recipe.dishType,
      occasion: recipe.occasion,
      ingredients: recipe.ingredients.map(ing => ing.item).join('\n'),
      instructions: recipe.instructions.map(inst => inst.step).join('\n'),
      notes: recipe.notes || '',
      image: recipe.image
    });
  };

  const handleSave = async () => {
    setNoChangesMessage('');
    // Compare formData with original recipe
    if (recipe) {
      const original = {
        title: recipe.title,
        description: recipe.description,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        mealType: recipe.mealType,
        cuisine: recipe.cuisine,
        dishType: recipe.dishType,
        occasion: recipe.occasion,
        ingredients: recipe.ingredients.map(ing => ing.item).join('\n'),
        instructions: recipe.instructions.map(inst => inst.step).join('\n'),
        notes: recipe.notes || '',
        image: recipe.image
      };
      let changed = false;
      for (const key in original) {
        if (formData[key] !== original[key]) {
          changed = true;
          break;
        }
      }
      if (!changed) {
        setNoChangesMessage('You made no changes.');
        return;
      }
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Convert ingredients and instructions to the correct format
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.split('\n')
          .filter(item => item.trim())
          .map(item => ({ item: item.trim() })),
        instructions: formData.instructions.split('\n')
          .filter(step => step.trim())
          .map((step, index) => ({ step: step.trim() }))
      };

      const response = await axios.put(`http://localhost:5000/api/recipes/${id}`, recipeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setRecipe(response.data);
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err.response?.data?.message || 'Failed to update recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/recipes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      navigate('/recipes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError(err.response?.data?.message || 'Failed to delete recipe');
      setLoading(false);
    }
  };

  const handleRateRecipe = async (rating) => {
    try {
      setRatingLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to rate recipes');
        return;
      }

      const response = await axios.post(`http://localhost:5000/api/recipes/${id}/rate`, 
        { rating },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setRecipe(response.data);
      setUserRating(rating);
      setError('');
    } catch (err) {
      console.error('Error rating recipe:', err);
      setError(err.response?.data?.message || 'Failed to rate recipe');
    } finally {
      setRatingLoading(false);
    }
  };

  const isOwner = user && recipe && user._id === recipe.userId._id;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto mb-4"></div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-primary-accent hover:bg-primary-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
          <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist.</p>
          <button
            onClick={handleGoBack}
            className="bg-primary-accent hover:bg-primary-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <BackButton className="mb-6" />
      <div className="max-w-4xl mx-auto">
        {/* Header with back button and action buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="text-sm text-gray-500 mb-2">Home &gt; Recipes &gt; {recipe.title}</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{recipe.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>By {recipe.userId?.username || 'Unknown Chef'}</span>
                <span>•</span>
                <StarRating rating={recipe.averageRating || 0} />
                <span>({recipe.ratingsCount || 0})</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {isOwner && (
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-primary-accent hover:bg-primary-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Edit Recipe
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Delete Recipe
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recipe Image */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-md"
              />
              <LikeButton 
                recipeId={recipe._id} 
                initialLikes={recipe.likes || 0}
                onLikeChange={(likes, isLiked) => {
                  // Update the recipe object
                  setRecipe(prev => ({ ...prev, likes }));
                }}
              />
            </div>
          </div>

          {/* Recipe Info */}
          <div className="lg:col-span-2">
            {!isEditing ? (
              // Display Mode
              <>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Recipe Information</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-accent">{recipe.prepTime}</div>
                      <div className="text-sm text-gray-600">Prep Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-accent">{recipe.cookTime}</div>
                      <div className="text-sm text-gray-600">Cook Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-accent">{recipe.servings}</div>
                      <div className="text-sm text-gray-600">Servings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-accent">{recipe.difficulty}</div>
                      <div className="text-sm text-gray-600">Difficulty</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {recipe.mealType}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {recipe.cuisine}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {recipe.dishType}
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      {recipe.occasion}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
                </div>

                {/* Rating Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Rate This Recipe</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <StarRating rating={recipe.averageRating || 0} size="lg" />
                      <span className="text-lg font-semibold text-gray-800">
                        {recipe.averageRating ? recipe.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-gray-600">
                        ({recipe.ratingsCount || 0} ratings)
                      </span>
                    </div>
                    
                    {!isOwner && user && (
                      <div className="flex items-center gap-4">
                        <span className="text-gray-700">Your rating:</span>
                        <StarRating 
                          rating={userRating} 
                          onRate={handleRateRecipe}
                          maxStars={5}
                          size="lg"
                        />
                        {ratingLoading && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-accent"></div>
                        )}
                      </div>
                    )}
                    
                    {isOwner && (
                      <div className="text-gray-600 italic">
                        You can't rate your own recipe
                      </div>
                    )}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-accent mr-2">•</span>
                        <span>{ingredient.item}</span>
                      </li>
              ))}
            </ul>
          </div>

                {/* Instructions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex">
                        <span className="bg-primary-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{instruction.step}</span>
                </li>
              ))}
            </ol>
          </div>

                {/* Notes */}
                {recipe.notes && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Notes</h2>
                    <p className="text-gray-700 leading-relaxed">{recipe.notes}</p>
                  </div>
                )}
              </>
            ) : (
              // Edit Mode
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6">Edit Recipe</h2>
                <form className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipe Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
              <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    />
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Prep Time *
                      </label>
                      <input
                        type="text"
                        id="prepTime"
                        name="prepTime"
                        value={formData.prepTime}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Cook Time *
                      </label>
                      <input
                        type="text"
                        id="cookTime"
                        name="cookTime"
                        value={formData.cookTime}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                        Servings *
                      </label>
                      <input
                        type="number"
                        id="servings"
                        name="servings"
                        value={formData.servings}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty *
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Type *
                      </label>
                      <select
                        id="mealType"
                        name="mealType"
                        value={formData.mealType}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Appetizers">Appetizers</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisine *
                      </label>
                      <select
                        id="cuisine"
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      >
                        <option value="Italian">Italian</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Indian">Indian</option>
                        <option value="American">American</option>
                        <option value="Thai">Thai</option>
                        <option value="Mediterranean">Mediterranean</option>
                        <option value="Japanese">Japanese</option>
                        <option value="French">French</option>
                        <option value="Other">Other</option>
                      </select>
          </div>
                    <div>
                      <label htmlFor="dishType" className="block text-sm font-medium text-gray-700 mb-2">
                        Dish Type *
                      </label>
                      <select
                        id="dishType"
                        name="dishType"
                        value={formData.dishType}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      >
                        <option value="Main Course">Main Course</option>
                        <option value="Side Dish">Side Dish</option>
                        <option value="Soup">Soup</option>
                        <option value="Salad">Salad</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Appetizer">Appetizer</option>
                        <option value="Breakfast">Breakfast</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                        Occasion *
                      </label>
                      <select
                        id="occasion"
                        name="occasion"
                        value={formData.occasion}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                      >
                        <option value="Everyday">Everyday</option>
                        <option value="Weekend">Weekend</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Party">Party</option>
                        <option value="Special Occasion">Special Occasion</option>
                        <option value="Quick Meal">Quick Meal</option>
                      </select>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                      Ingredients * (one per line)
                    </label>
                    <textarea
                      id="ingredients"
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions * (one step per line)
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      required
                      rows="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipe Image *
                    </label>
                    <textarea
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    />
                  </div>
                </form>
                </div>
            )}
          </div>
        </div>

        {noChangesMessage && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            {noChangesMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetailPage;