// flavorhut-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getUserById, 
  verifyEmail 
} = require('../controllers/authController');
const passport = require('passport');

// Public routes
router.post('/register', registerUser); // POST /api/auth/register
router.post('/login', loginUser);       // POST /api/auth/login
router.get('/user/:id', getUserById);   // GET /api/auth/user/:id
router.post('/verify', verifyEmail);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)         // GET /api/auth/profile
  .put(protect, updateUserProfile);     // PUT /api/auth/profile

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend with JWT token
    const token = req.user && req.user._jwt;
    if (token) {
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}`); // Use frontend URL from env
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth`);
    }
  }
);

module.exports = router;
