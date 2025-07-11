
const Recipe = require('../models/Recipe');

exports.getRecipes = async (req, res) => {
  try {
    const { search, category, cuisine, difficulty, mealType } = req.query;
    
    
    let filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.mealType = category;
    if (cuisine) filter.cuisine = cuisine;
    if (difficulty) filter.difficulty = difficulty;
    if (mealType) filter.mealType = mealType;

    const recipes = await Recipe.find(filter).populate('userId', 'username firstName lastName');
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('userId', 'username profilePictureUrl');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') { // Handle invalid MongoDB ID format
        return res.status(400).json({ message: 'Invalid Recipe ID' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRecipesByUser = async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.params.userId }).populate('userId', 'username profilePictureUrl');
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addRecipe = async (req, res) => {
  try {
    let {
      title, description, image,
      prepTime, cookTime, servings, difficulty,
      mealType, cuisine, dietaryNeeds, dishType, occasion,
      ingredients, instructions, notes
    } = req.body;

    
    if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
    if (typeof instructions === 'string') instructions = JSON.parse(instructions);
    if (typeof dietaryNeeds === 'string') dietaryNeeds = JSON.parse(dietaryNeeds);

    
    if (req.file) {
      console.log('Image file received:', req.file.originalname, 'Size:', req.file.size, 'Mime type:', req.file.mimetype);
      const base64Image = req.file.buffer.toString('base64');
      image = `data:${req.file.mimetype};base64,${base64Image}`;
    } else {
      console.log('No image file received in request');
    }

    
    const userId = req.user._id;

    
    if (!title || !description || (!image && !req.file) || !prepTime || !cookTime || !servings || !difficulty || !mealType || !cuisine || !dishType || !occasion || !ingredients || ingredients.length === 0 || !instructions || instructions.length === 0) {
      return res.status(400).json({ message: 'Please enter all required fields for the recipe.' });
    }

    const newRecipe = new Recipe({
      userId,
      title,
      description,
      image,
      prepTime,
      cookTime,
      servings,
      difficulty,
      mealType,
      cuisine,
      dietaryNeeds,
      dishType,
      occasion,
      ingredients,
      instructions,
      notes
    });

    const createdRecipe = await newRecipe.save();
    res.status(201).json(createdRecipe); 
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

  
    if (recipe.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this recipe' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Recipe ID' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

   
    if (recipe.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this recipe' });
    }

    await recipe.deleteOne();
    res.json({ message: 'Recipe removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Recipe ID' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.rateRecipe = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // User is authenticated (middleware ensures this)
    const newRatingCount = recipe.ratingsCount + 1;
    const newAverageRating = ((recipe.averageRating * recipe.ratingsCount) + rating) / newRatingCount;

    recipe.averageRating = newAverageRating;
    recipe.ratingsCount = newRatingCount;
    
    await recipe.save();
    
    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // User is authenticated (middleware ensures this)
    const userId = req.user._id;
    const isLiked = recipe.likedBy.includes(userId);

    if (isLiked) {
      
      recipe.likedBy = recipe.likedBy.filter(id => id.toString() !== userId.toString());
      recipe.likes = Math.max(0, recipe.likes - 1);
    } else {
      
      recipe.likedBy.push(userId);
      recipe.likes = recipe.likes + 1;
    }
    
    await recipe.save();
    
    res.json({
      likes: recipe.likes,
      isLiked: !isLiked,
      message: isLiked ? 'Recipe unliked!' : 'Recipe liked!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getLikeStatus = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    
    const userId = req.user._id;
    const isLiked = recipe.likedBy.includes(userId);
    
    res.json({
      likes: recipe.likes,
      isLiked: isLiked
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
