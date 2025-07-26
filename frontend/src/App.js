import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div className="logo">
              <span className="airplane-icon">
                <svg viewBox="0 0 24 24" fill="#3b82f6" width="32" height="32" style={{ display: 'block' }}>
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </span>
              <h1>MyTrippers</h1>
            </div>
            <nav>
              <a href="/">Home</a>
              <a href="/results">Flights</a>
              <a href="/hotels">Hotels</a>
            </nav>
          </div>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </main>

        <footer className="App-footer">
          <p>&copy; 2025 MyTrippers. Compare prices from multiple platforms.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;



