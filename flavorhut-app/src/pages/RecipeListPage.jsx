import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { recipeAPI } from '../services/api';

function RecipeListPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Get category from query param
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    setSelectedCategory(queryParams.get('category') || 'all');
  }, [location.search]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll();
      setRecipes(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.mealType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto mb-4"></div>
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow">
      {/* Banner Section with Background - Full Width */}
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
            <h1 className="text-4xl font-bold text-white mb-4">
              {selectedCategory !== 'all' ? selectedCategory : 'All Recipes'}
            </h1>
            <p className="text-lg text-white">
              {selectedCategory !== 'all' 
                ? `Discover delicious ${selectedCategory.toLowerCase()} recipes from our community`
                : 'Discover delicious recipes from our community'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        {/* Prominent Search Bar */}
        <div className="w-full max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search for recipes..."
              className="w-full py-3 px-5 pr-12 rounded-full border border-gray-300 shadow focus:ring-2 focus:ring-primary-accent focus:border-primary-accent text-lg transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-accent"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Recipes Grid */}
        <div className="lg:w-3/4 mx-auto">
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || selectedCategory !== 'all' ? 'No recipes found' : 'No recipes yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Be the first to share a delicious recipe!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeListPage;
