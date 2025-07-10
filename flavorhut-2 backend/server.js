// flavorhut-backend/server.js
const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();
const nodemailer = require('nodemailer');
console.log('Current working directory:', process.cwd());
const fs = require('fs');

const PORT = process.env.PORT || 5000;
app.get("/", (req,res) => {
  try{
      res.send("This API is working properly");
  }catch(err){
      res.send("Internal server Error");
  }
})
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});
