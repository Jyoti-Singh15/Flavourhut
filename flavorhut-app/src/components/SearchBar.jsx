import React, { useState } from 'react';

function SearchBar({ onSearch, placeholder = "Search for recipes..." }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow p-3 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent text-text-body"
      />
      <button
        type="submit"
        className="bg-primary-accent text-white px-6 rounded-r-full flex items-center justify-center hover:bg-opacity-90 transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <span className="ml-2 hidden sm:inline">Search</span>
      </button>
    </form>
  );
}

export default SearchBar;