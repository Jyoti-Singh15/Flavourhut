// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import googleLogo from '../assets/Google__G__logo.svg.webp';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);

    if (result.success) {
      navigate('/verify-email', { state: { email: formData.email } });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-heading font-bold text-text-heading text-center mb-6">Join FlavorHut</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-text-body text-sm font-medium mb-1">Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-accent focus:border-primary-accent"
              placeholder="Choose a unique username"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-text-body text-sm font-medium mb-1">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-accent focus:border-primary-accent"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-text-body text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-accent focus:border-primary-accent"
              placeholder="********"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-text-body text-sm font-medium mb-1">Confirm Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-accent focus:border-primary-accent"
              placeholder="********"
              required
            />
          </div>
          <Button type="submit" variant="primary" className="w-full py-3 text-lg" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </div>
            ) : (
              'Register'
            )}
          </Button>
          
        </form>
        {/* Divider with text */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 bg-white px-2 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button
          onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-800 py-3 rounded-2xl font-semibold text-lg shadow-sm hover:bg-gray-50 transition"
        >
          <img src={googleLogo} alt="Google logo" className="w-6 h-6" />
          <span className="font-medium">Continue with Google</span>
        </button>
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link to="/login" className="text-primary-accent hover:underline font-semibold">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;