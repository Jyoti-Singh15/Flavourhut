// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import GoogleAuthHandler from './contexts/GoogleAuthHandler';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Import our page components
import HomePage from './pages/HomePage';
import RecipeListPage from './pages/RecipeListPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import AddRecipePage from './pages/AddRecipePage'; // We'll create this next
import UserProfilePage from './pages/UserProfilePage'; // Placeholder
import LoginPage from './pages/LoginPage'; // Placeholder
import RegisterPage from './pages/RegisterPage'; // Placeholder
import AdminPage from './pages/AdminPage'; // Admin page
import NotFoundPage from './pages/NotFoundPage'; // Simple 404 page
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  return (
    <AuthProvider>
      <GoogleAuthHandler />
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes" element={<RecipeListPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} /> {/* Dynamic route for individual recipes */}

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route 
              path="/add-recipe" 
              element={
                <ProtectedRoute>
                  <AddRecipePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
        {/* Add more protected routes as needed, e.g., /dashboard, /settings */}

        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />

        {/* Verify Email Page */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
        </main>
        <Footer />
    </div>
    </AuthProvider>
  );
}

export default App;