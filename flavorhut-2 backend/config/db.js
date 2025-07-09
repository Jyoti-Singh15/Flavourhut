// flavorhut-backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/flavorhut';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;