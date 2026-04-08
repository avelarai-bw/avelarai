const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const exportRoutes = require('./routes/export');


dotenv.config();

const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://avelarai.vercel.app',
    'https://avelarai-git-main-avelarai269-4786s-projects.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files statically (temp storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/analysis', exportRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', product: 'AvelarAI' });
});
app.get('/api/models', async (_req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const MONGO_URI = process.env.MONGO_URI;
console.log('Connecting to MongoDB with URI:', MONGO_URI);
console.log('MongoDB URI from env:', process.env.MONGO_URI);
console.log('jwt secret from env:', process.env.JWT_SECRET);
console.log('GEMINI API key from env:', process.env.GEMINI_API_KEY);

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`AvelarAI server running on port ${PORT}`);
});