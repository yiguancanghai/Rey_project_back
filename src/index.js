/**
 * Server entry point for Rey's Portfolio API
 */
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// Get port from environment and store in Express
const PORT = process.env.PORT || 5000;

// Get the MongoDB URI from environment variables - check multiple possible names
const mongoURI = process.env.MONGO_URL || 
                process.env.MONGODB_URI || 
                process.env.MONGO_URI || 
                process.env.DATABASE_URL;

// Log the MongoDB connection string (hide sensitive info)
console.log('Attempting to connect to MongoDB at:', mongoURI ? 'URI exists (not shown for security)' : 'URI is undefined');

// Make sure we have a connection string before attempting to connect
if (!mongoURI) {
  console.error('MongoDB connection string is missing in environment variables!');
  console.error('Available environment variables:', Object.keys(process.env));
  process.exit(1); // Exit the application with an error
}

// Connect to MongoDB - without deprecated options
mongoose.connect(mongoURI)
.then(() => {
  console.log('Connected to MongoDB successfully');
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  });
})
.catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});