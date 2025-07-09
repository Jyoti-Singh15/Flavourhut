import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import axios from 'axios';
import { recipeAPI } from '../services/api';

const heroImage = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Category data for cards
  const categories = [
    {
      name: 'Breakfast',
      image: '/breakfast.jpg',
      description: 'Start your day right',
    },
    {
      name: 'Lunch',
      image: '/lunch.jpg',
      description: 'Midday energy boost',
    },
    {
      name: 'Dinner',
      image: '/dinner.jpeg',
      description: 'Hearty evening meals',
    },
    {
      name: 'Dessert',
      image: '/dessert.jpg',
      description: 'Sweet treats',
    },
    {
      name: 'Snacks',
      image: '/Snacks.jpeg',
      description: 'Quick bites',
    },
    {
      name: 'Beverages',
      image: '/bavarages.jpg',
      description: 'Drinks & refreshments',
    },
    {
      name: 'Soups',
      image: '/soups.jpg',
      description: 'Warm & comforting',
    },
    {
      name: 'Salads',
      image: '/salads.jpg',
      description: 'Fresh & healthy',
    },
    {
      name: 'Pasta',
      image: '/Pasta.jpg',
      description: 'Italian classics',
    },
    {
      name: 'Rice Dishes',
      image: '/Rice Dises.jpg',
      description: 'Global rice favorites',
    },
    {
      name: 'Curries',
      image: '/curries.jpg',
      description: 'Spicy & flavorful',
    },
    {
      name: 'Bakes',
      image: '/bakes.jpg',
      description: 'Oven goodness',
    },
  ];

  // Count recipes per category
  const getRecipeCount = (cat) => recipes.filter(r => r.mealType === cat).length;

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll();
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipeClick = () => {
    if (isAuthenticated) {
      navigate('/add-recipe');
    } else {
      navigate('/login');
    }
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.mealType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto mb-4"></div>
          <p>Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section with Banner Background - Full Width */}
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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">
              Welcome to <span className="text-primary-accent">FlavorHut</span>
            </h1>
            <p className="text-xl text-white mb-6 max-w-2xl mx-auto">
              Discover, share, and savor amazing recipes from around the world. 
              Join our community of food lovers and culinary enthusiasts.
            </p>
            
            {/* Add New Recipe Button Inside Banner */}
            <button
              onClick={handleAddRecipeClick}
              className="bg-primary-accent hover:bg-primary-accent/90 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              {isAuthenticated ? 'Add New Recipe' : 'Login to Add Recipe'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Browse by Category Section */}
        <section className="my-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-1">Browse by Category</h2>
          <p className="text-center text-gray-500 mb-6">Find recipes that match your mood</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={`/recipes?category=${encodeURIComponent(cat.name)}`}
                className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-4 flex flex-col items-center border-2`}
              >
                <img src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded-full mb-2 border-2 border-gray-200 group-hover:border-primary-accent" />
                <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
                <p className="text-gray-500 text-sm mb-1">{cat.description}</p>
                <span className={`text-xs font-semibold ${getRecipeCount(cat.name) > 0 ? 'text-primary-accent' : 'text-gray-400'}`}>{getRecipeCount(cat.name)} recipe{getRecipeCount(cat.name) === 1 ? '' : 's'}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Recipes Grid - REMOVED */}
        {/* No recipes should be shown on the Home page */}
      </div>
    </div>
  );
};

export default HomePage;
