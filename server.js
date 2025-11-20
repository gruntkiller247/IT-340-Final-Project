const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;

//  Add Middleware to parse JSON bodies (CRITICAL for handling form data)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//  Connect to MongoDB
const dbURI = 'mongodb://localhost:27017/myLocalDatabase';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB Error:', err));

//  Define User Schema & Model (Do this ONCE, outside routes)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true } // In a real app, hash this with bcrypt!
});
const User = mongoose.model('User', userSchema);

//  Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    const newUser = new User({ username, email, password });
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
    const user = await User.findOne({ username, password });
    
    if (user) {
      res.json({ success: true, username: user.username });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
