// flavorhut-backend/models/Recipe.js
const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  item: { type: String, required: true }
}, { _id: false }); // Don't create _id for sub-documents if not needed

const InstructionSchema = new mongoose.Schema({
  step: { type: String, required: true }
}, { _id: false }); // Don't create _id for sub-documents if not needed

const RecipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to a User model (we'll make this later)
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the recipe'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    validate: {
      validator: function(v) {
        if (!v) return false;
        // Count words by splitting on whitespace
        return v.trim().split(/\s+/).length <= 500;
      },
      message: 'Description cannot be more than 500 words'
    }
  },
  image: {
    type: String,
    required: [true, 'Please add an image'],
  },
  prepTime: {
    type: String,
    required: true,
  },
  cookTime: {
    type: String,
    required: true,
  },
  servings: {
    type: Number,
    required: true,
    min: [1, 'Servings must be at least 1']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  mealType: { // Simple string for category, can be array or ref to category model later
    type: String,
    required: true
  },
  cuisine: {
    type: String,
    required: true
  },
  dietaryNeeds: { // Array of strings for multiple selections
    type: [String],
    default: []
  },
  dishType: {
    type: String,
    required: true
  },
  occasion: {
    type: String,
    required: true
  },
  ingredients: {
    type: [IngredientSchema], // Embedded array of ingredient objects
    required: [true, 'Please add at least one ingredient']
  },
  instructions: {
    type: [InstructionSchema], // Embedded array of instruction objects
    required: [true, 'Please add at least one instruction step']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    default: ''
  },
  averageRating: { // Can be updated via aggregation or separate logic
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingsCount: { // Keep track of how many ratings
    type: Number,
    default: 0
  },
  likes: { // Total number of likes
    type: Number,
    default: 0
  },
  likedBy: [{ // Array of user IDs who liked this recipe
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Recipe', RecipeSchema);