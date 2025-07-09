const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/imageUpload');

// @desc    Upload profile picture
// @route   POST /api/images/profile
// @access  Private
router.post('/profile', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    // Save to user profile
    const user = req.user;
    user.profilePictureUrl = dataUrl;
    await user.save();
    res.json({
      success: true,
      image: dataUrl,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ message: 'Please upload a valid image file (JPG, PNG, GIF, WebP)' });
    }
    if (error.message.includes('File too large')) {
      return res.status(400).json({ message: 'Image file is too large. Maximum size is 5MB.' });
    }
    res.status(500).json({ message: 'Failed to upload image. Please try again.' });
  }
});

// @desc    Upload recipe image
// @route   POST /api/images/recipe
// @access  Private
router.post('/recipe', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ message: 'Missing recipeId in request body.' });
    }
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    const Recipe = require('../models/Recipe');
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }
    // Only allow the owner to update the image
    if (recipe.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this recipe image.' });
    }
    recipe.image = dataUrl;
    await recipe.save();
    res.json({
      success: true,
      image: dataUrl,
      message: 'Recipe image uploaded and saved successfully.'
    });
  } catch (error) {
    console.error('Error uploading recipe image:', error);
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ message: 'Please upload a valid image file (JPG, PNG, GIF, WebP)' });
    }
    if (error.message.includes('File too large')) {
      return res.status(400).json({ message: 'Image file is too large. Maximum size is 5MB.' });
    }
    res.status(500).json({ message: 'Failed to upload image. Please try again.' });
  }
});

module.exports = router; 