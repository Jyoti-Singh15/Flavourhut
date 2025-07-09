import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {/* Using the FlavorHut PNG logo */}
            <img src="/logo.png" alt="FlavorHut Logo" className="h-10 w-auto mr-3" />
            <span className="text-2xl font-heading font-bold text-primary-accent hidden sm:block">FlavorHut</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-lg font-semibold">
          <Link to="/" className="text-text-body hover:text-primary-accent transition-colors duration-200">Home</Link>
          <Link to="/recipes" className="text-text-body hover:text-primary-accent transition-colors duration-200">Recipes</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/add-recipe" className="text-text-body hover:text-primary-accent transition-colors duration-200">Add Recipe</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-red-600 hover:text-red-700 transition-colors duration-200">Admin</Link>
              )}
              <div className="relative group">
                <button className="text-text-body hover:text-primary-accent transition-colors duration-200 flex items-center">
                  <img 
                    src={user?.profilePictureUrl || "https://via.placeholder.com/32/CCCCCC/888888?text=U"} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span>{user?.username}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-text-body hover:text-primary-accent transition-colors duration-200">Login</Link>
              <Link to="/register" className="bg-primary-accent text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-text-body hover:text-primary-accent">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white bg-opacity-95 z-50 flex flex-col items-center justify-center space-y-8 text-2xl font-semibold">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-text-body hover:text-primary-accent text-4xl">×</button>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-text-body hover:text-primary-accent transition-colors duration-200">Home</Link>
          <Link to="/recipes" onClick={() => setIsMobileMenuOpen(false)} className="text-text-body hover:text-primary-accent transition-colors duration-200">Recipes</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/add-recipe" onClick={() => setIsMobileMenuOpen(false)} className="text-text-body hover:text-primary-accent transition-colors duration-200">Add Recipe</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-red-600 hover:text-red-700 transition-colors duration-200">Admin</Link>
              )}
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-text-body hover:text-primary-accent transition-colors duration-200">Profile</Link>
              <button onClick={handleLogout} className="text-text-body hover:text-primary-accent transition-colors duration-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-text-body hover:text-primary-accent transition-colors duration-200">Login</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-text-body hover:text-primary-accent transition-colors duration-200">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;