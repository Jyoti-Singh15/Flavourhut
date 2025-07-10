
import React, { useState } from 'react';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import config from '../config/config';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-heading font-bold text-text-heading text-center mb-6">Login to FlavorHut</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-text-body text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-accent focus:border-primary-accent"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-text-body text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Logging in...
              </div>
            ) : (
              'Login'
            )}
            
          </Button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-3 text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        <button
          type="button"
          onClick={() => {
            window.location.href = `${config.API_BASE_URL}/auth/google`;
          }}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-2 px-4 bg-white hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.77-5.77C34.13 3.36 29.64 1.5 24 1.5 14.82 1.5 6.98 7.98 3.69 16.44l6.91 5.37C12.13 15.09 17.56 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.91-2.18 5.38-4.66 7.04l7.19 5.6C43.98 37.02 46.1 31.23 46.1 24.5z"/>
              <path fill="#FBBC05" d="M10.6 28.13a14.5 14.5 0 010-8.26l-6.91-5.37A23.97 23.97 0 001.9 24.5c0 3.82.92 7.44 2.54 10.63l6.91-5.37z"/>
              <path fill="#EA4335" d="M24 46.5c6.48 0 11.93-2.15 15.9-5.87l-7.19-5.6c-2.01 1.35-4.59 2.17-8.71 2.17-6.44 0-11.87-5.59-13.4-12.63l-6.91 5.37C6.98 41.02 14.82 46.5 24 46.5z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </g>
          </svg>
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account? <Link to="/register" className="text-primary-accent hover:underline font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
