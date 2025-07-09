const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (admin only)
router.get('/users', protect, adminMiddleware, async (req, res) => {
  try {
    console.log('🔍 Admin requesting users list');
    console.log('User making request:', req.user.email, 'Role:', req.user.role);
    
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    console.log('✅ Found', users.length, 'users');
    
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', protect, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete all recipes by this user
    await Recipe.deleteMany({ author: req.params.id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User and all their recipes deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:id/status', protect, adminMiddleware, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own account status' });
    }

    user.isActive = isActive;
    await user.save();
    
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard stats
router.get('/stats', protect, adminMiddleware, async (req, res) => {
  try {
    console.log('🔍 Admin requesting stats');
    console.log('User making request:', req.user.email, 'Role:', req.user.role);
    
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    
    // Get recent data (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const recentRecipes = await Recipe.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    
    // Get recipes by category
    const recipesByCategory = await Recipe.aggregate([
      { $group: { _id: '$mealType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('✅ Stats calculated:', { totalUsers, totalRecipes, recentUsers, recentRecipes });
    
    res.json({
      totalUsers,
      totalRecipes,
      recentUsers,
      recentRecipes,
      recipesByCategory
    });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote user to admin (development only)
router.patch('/users/:id/promote', protect, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'admin';
    await user.save();
    
    res.json({ message: 'User promoted to admin successfully', user });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 