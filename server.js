const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Add path module for better file path management
const app = express();
const port = 3000;

// MongoDB connection URI for local MongoDB
const dbURI = 'mongodb://localhost:27017/myLocalDatabase';

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected to local instance');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

// Serve static files (like index.html) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Test route to verify server and MongoDB connection
app.get('/', (req, res) => {
  // The index.html file is automatically served because it's in the "public" folder
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example route for database interaction
app.get('/test-db', async (req, res) => {
  try {
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String
    }));

    const user = new User({ name: 'John Doe', email: 'john.doe@example.com' });
    await user.save();

    res.send('User saved to MongoDB');
  } catch (err) {
    res.status(500).send('Error saving user: ' + err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

