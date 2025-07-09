// flavorhut-backend/routes/recipeRoutes.js
const express = require('express');
const { 
  getRecipes, 
  getRecipeById, 
  getRecipesByUser,
  addRecipe, 
  updateRecipe, 
  deleteRecipe, 
  rateRecipe,
  likeRecipe,
  getLikeStatus
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

// Public routes
router.route('/')
  .get(getRecipes); // GET /api/recipes (with optional query params)

router.route('/:id')
  .get(getRecipeById); // GET /api/recipes/:id

router.get('/user/:userId', getRecipesByUser); // GET /api/recipes/user/:userId

// Protected rating and like routes
router.post('/:id/rate', protect, rateRecipe); // POST /api/recipes/:id/rate
router.post('/:id/like', protect, likeRecipe); // POST /api/recipes/:id/like
router.get('/:id/like-status', protect, getLikeStatus); // GET /api/recipes/:id/like-status

// Protected routes
router.post('/', protect, addRecipe); // POST /api/recipes

router.route('/:id')
  .put(protect, updateRecipe)     // PUT /api/recipes/:id
  .delete(protect, deleteRecipe); // DELETE /api/recipes/:id

module.exports = router;