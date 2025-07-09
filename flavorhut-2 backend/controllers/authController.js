// flavorhut-backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // For generating JWTs
const sendVerificationEmail = require('../utils/sendEmail');

// Helper function to generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Basic validation - firstName and lastName are now optional
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter username, email, and password.' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const newUser = await User.create({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000 // 10 minutes from now
    });

    // Send verification email
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: 'Registration successful. Please check your email for the verification code.' });
  } catch (error) {
    console.error(error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    // Handle duplicate key error (e.g., username or email already exists)
    if (error.code === 11000) {
        // Check which field caused the duplicate error
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ message: `Duplicate ${field}: ${error.keyValue[field]} already exists.` });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password.' });
  }

  try {
    // Find user by email, select password as it's set to 'select: false'
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare provided password with hashed password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Login successful
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      profilePictureUrl: user.profilePictureUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, bio, profilePictureUrl, firstName, lastName } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      user.username = username || user.username;
      user.email = email || user.email;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.bio = bio !== undefined ? bio : user.bio;
      user.profilePictureUrl = profilePictureUrl || user.profilePictureUrl;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profilePictureUrl: updatedUser.profilePictureUrl,
        bio: updatedUser.bio,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `Duplicate ${field}: ${error.keyValue[field]} already exists.` });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/auth/user/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid User ID' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify
// @access  Public
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }
    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }
    user.isVerified = true;
    user.verificationCode = '';
    user.verificationCodeExpires = null;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};