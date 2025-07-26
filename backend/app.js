const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
