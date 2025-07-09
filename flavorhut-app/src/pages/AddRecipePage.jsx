import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Button from '../components/Button'; // Reusable Button component
import BackButton from '../components/BackButton';

// Define simplified category options for dropdowns in the add recipe form
// These align with the main groups from CategoryFilter.jsx
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snacks & Appetizers", "Beverages", "Other"];
const cuisines = ["Indian", "Italian", "Mexican", "Chinese", "American", "Thai", "Mediterranean", "Japanese", "French", "Other"];
const dietaryNeeds = ["None", "Vegan", "Gluten-Free", "Keto", "Vegetarian", "Dairy-Free", "Nut-Free"];
const dishTypes = ["Soups", "Salads", "Pasta", "Rice Dishes", "Bakes", "Roasts", "Stir-Fries", "Curries", "BBQ/Grill", "Casseroles", "Sandwiches", "Other"];
const prepTimes = ["Quick & Easy (Under 30 Mins)", "Mid-Range (30-60 Mins)", "Long Prep (Over 60 Mins)"];
const occasions = ["Everyday Meals", "Weeknight Dinners", "Special Occasions", "Holidays", "Parties", "Brunch", "Other"];
const difficulties = ["Easy", "Medium", "Hard"];

const AddRecipePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Easy',
    mealType: 'Dinner',
    cuisine: 'Italian',
    dishType: 'Main Course',
    occasion: 'Everyday',
    dietaryNeeds: [],
    notes: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Word count for description
  const descriptionWordCount = formData.description.trim() ? formData.description.trim().split(/\s+/).length : 0;

  const handleChange = (e) => {
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
        const response = await axios.post('http://localhost:5000/api/images/recipe', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        const image = response.data.image;
        setImagePreview(image);
        setFormData(prev => ({ ...prev, image: image }));
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

    try {
      // Convert ingredients and instructions to the correct format for the schema
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.split('\n')
          .filter(item => item.trim())
          .map(item => ({ item: item.trim() })),
        instructions: formData.instructions.split('\n')
          .filter(step => step.trim())
          .map((step, index) => ({ step: step.trim() }))
      };

      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug log
      console.log('Recipe data:', recipeData); // Debug log
      
      const response = await axios.post('http://localhost:5000/api/recipes', recipeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Recipe added successfully:', response.data);
      navigate('/recipes');
    } catch (err) {
      console.error('Error adding recipe:', err);
      console.error('Error response:', err.response); // Debug log
      setError(err.response?.data?.message || 'Failed to add recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Add this function to fetch and auto-fill from TheMealDB
  const handleAutoFill = async () => {
    if (!formData.title) return;
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(formData.title)}`);
      const data = await res.json();
      if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];
        // Gather ingredients and measures
        let ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredients.push(`${ingredient}${measure && measure.trim() ? ' - ' + measure : ''}`);
          }
        }
        setFormData(prev => ({
          ...prev,
          description: meal.strInstructions || '',
          ingredients: ingredients.join('\n'),
          instructions: meal.strInstructions || '',
          image: meal.strMealThumb || '',
          cuisine: meal.strArea || prev.cuisine,
          title: meal.strMeal || prev.title,
        }));
        setImagePreview(meal.strMealThumb || '');
        setError('');
      } else {
        setError('No recipe found for that title.');
      }
    } catch (err) {
      setError('Failed to fetch recipe from TheMealDB.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <BackButton className="mr-4" />
        <h1 className="text-3xl font-bold text-gray-800">Add New Recipe</h1>
      </div>

      {/* User info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          <span className="font-semibold">Adding recipe as:</span> {user?.username || user?.email}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipe Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Title *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              placeholder="Enter recipe title..."
            />
            <button
              type="button"
              onClick={handleAutoFill}
              className="ml-2"
            >
              <Button type="button" variant="primary" className="py-2 px-4 rounded-md text-base font-semibold">
                Auto-Fill Recipe Details
              </Button>
            </button>
          </div>
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
            placeholder="Describe your recipe..."
          />
          <div className={`text-xs mt-1 text-right ${descriptionWordCount > 500 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
            {descriptionWordCount} / 500 words
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Image *
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-2"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg border mb-2" />
          )}
        </div>

        {/* Category and Difficulty */}
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
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level *
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

        {/* Cooking Time and Servings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
              Preparation Time *
            </label>
            <input
              type="text"
              id="prepTime"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              placeholder="e.g., 15 minutes"
            />
          </div>

          <div>
            <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Time *
            </label>
            <input
              type="text"
              id="cookTime"
              name="cookTime"
              value={formData.cookTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              placeholder="e.g., 30 minutes"
            />
          </div>
        </div>

        {/* Servings and Cuisine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="e.g., 4"
            />
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
        </div>

        {/* Dish Type and Occasion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs&#10;1/2 cup milk"
          />
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Cooking Instructions * (one step per line)
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows="8"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            placeholder="Step 1: Preheat oven to 350°F&#10;Step 2: Mix dry ingredients&#10;Step 3: Add wet ingredients&#10;Step 4: Bake for 30 minutes"
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
            placeholder="Any additional tips, variations, or notes about your recipe..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-accent hover:bg-primary-accent/90 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Adding Recipe...' : 'Add Recipe'}
          </button>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipePage;