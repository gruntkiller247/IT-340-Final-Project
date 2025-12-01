const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt'); // Import bcrypt
const app = express();
const port = 3000;

// Add Middleware to parse JSON bodies (CRITICAL for handling form data)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
const dbURI = 'mongodb://localhost:27017/myLocalDatabase';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB Error:', err));

// Define User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  // "Game stats are set to 0 if not logged in, Random; else"
  // Since this is a registered user, we default to a random number.
  gameScore: { 
    type: Number, 
    default: () => Math.floor(Math.random() * 1000) 
  },
  // "Add this as a flag to the database"
  isGuest: { type: Boolean, default: false } 
});

const User = mongoose.model('User', userSchema);

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
      // gameScore is automatically set to random by the default function in schema
    });

    await newUser.save();
    res.json({ success: true, message: 'User registered!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      // Return success along with the game stats/flag
      res.json({ 
        success: true, 
        username: user.username,
        gameScore: user.gameScore,
        isGuest: user.isGuest
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example route for database interaction (Cleaned up duplicate from original file)
app.get('/test-db', async (req, res) => {
  try {
    // Note: Creating a model inside a route is bad practice, but keeping for your reference
    // Ideally use the 'User' model defined above.
    const testUser = new User({ 
        username: 'TestUser_' + Date.now(), 
        email: 'test@example.com', 
        password: 'testpassword' 
    });
    await testUser.save();
    res.send('User saved to MongoDB');
  } catch (err) {
    res.status(500).send('Error saving user: ' + err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
