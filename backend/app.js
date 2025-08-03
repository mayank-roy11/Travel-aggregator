const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const app = express();

// Middleware
app.use(cors()); // Simple CORS configuration

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/flights', require('./routes/flightRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Travel Aggregator API is running' });
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
