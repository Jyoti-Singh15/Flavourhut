// flavorhut-backend/app.js
const express = require('express');
const cors = require('cors');
const recipeRoutes = require('./routes/recipeRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const imageRoutes = require('./routes/imageRoutes'); // Import image routes

const app = express();

// Google OAuth session and passport setup
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

app.use(session({
  secret: 'your_secret_key', // Use a strong secret in production!
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://yourdomain.com'] // Add your production frontend URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes); // Add image routes

// Simple root route
app.get('/', (req, res) => {
  res.send('FlavorHut Backend API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;