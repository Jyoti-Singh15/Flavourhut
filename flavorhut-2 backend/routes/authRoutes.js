
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
router.post('/register', registerUser); 
router.post('/login', loginUser);       
router.get('/user/:id', getUserById);   
router.post('/verify', verifyEmail);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)         
  .put(protect, updateUserProfile);     

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    
    const token = req.user && req.user._jwt;
    if (token) {
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}`); 
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth`);
    }
  }
);

module.exports = router;
