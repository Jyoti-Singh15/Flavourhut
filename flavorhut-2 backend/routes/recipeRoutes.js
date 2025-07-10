
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
const { protect } = require('../middleware/authMiddleware'); 
const { upload } = require('../utils/imageUpload');

const router = express.Router();

// Public routes
router.route('/')
  .get(getRecipes); 

router.route('/:id')
  .get(getRecipeById); 

router.get('/user/:userId', getRecipesByUser); 

// Protected rating and like routes
router.post('/:id/rate', protect, rateRecipe); 
router.post('/:id/like', protect, likeRecipe); 
router.get('/:id/like-status', protect, getLikeStatus); 

// Protected routes
router.post('/', protect, upload.single('image'), addRecipe); 

router.route('/:id')
  .put(protect, updateRecipe)     
  .delete(protect, deleteRecipe); 

module.exports = router;
