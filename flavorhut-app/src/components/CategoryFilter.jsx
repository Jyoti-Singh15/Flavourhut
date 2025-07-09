import React from 'react';

const CategoryFilter = ({ onCategoryChange, selectedCategory = 'all' }) => {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Breakfast', label: 'Breakfast' },
    { value: 'Lunch', label: 'Lunch' },
    { value: 'Dinner', label: 'Dinner' },
    { value: 'Dessert', label: 'Dessert' },
    { value: 'Snacks', label: 'Snacks' },
    { value: 'Beverages', label: 'Beverages' },
    { value: 'Appetizers', label: 'Appetizers' },
    { value: 'Soups', label: 'Soups' },
    { value: 'Salads', label: 'Salads' },
    { value: 'Pasta', label: 'Pasta' },
    { value: 'Rice Dishes', label: 'Rice Dishes' },
    { value: 'Curries', label: 'Curries' },
    { value: 'Bakes', label: 'Bakes' },
    { value: 'Grill', label: 'Grill' }
  ];

  return (
    <div className="w-full md:w-64">
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Category
      </label>
      <select
        id="category"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent bg-white"
      >
        {categories.map(category => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;