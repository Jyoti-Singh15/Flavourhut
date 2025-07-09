const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Helper to split displayName
      const splitName = (displayName) => {
        if (!displayName) return { firstName: '', lastName: '' };
        const parts = displayName.split(' ');
        return {
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || ''
        };
      };
      const { firstName, lastName } = splitName(profile.displayName);
      const profilePictureUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '';
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Check if a user with the same email already exists
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.isVerified = true;
          user.firstName = firstName;
          user.lastName = lastName;
          user.profilePictureUrl = profilePictureUrl;
          await user.save();
        } else {
          // Create a new user if no user with this email exists
          user = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            isVerified: true,
            firstName,
            lastName,
            profilePictureUrl
          });
        }
      }
      // Generate JWT
      const token = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      // Attach token to user object for callback
      user._jwt = token;
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
}); 