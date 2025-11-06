const express = require('express');
const mongoose = require('mongoose'); // Add mongoose
const app = express();
const port = 3000;

// MongoDB connection URI
const dbURI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

// Test route to verify server and MongoDB connection
app.get('/', (req, res) => {
  res.send('Hello MEAN Stack!');
});

// Example route for database interaction (can be modified)
app.get('/test-db', async (req, res) => {
  try {
    // Simple Mongoose model example
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String
    }));

    // Create a new user (just for testing purposes)
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

