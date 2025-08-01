import React, { useState, useEffect } from 'react';
import './ResultList.css';
import { getFlightDetails, generateBookingLink } from '../api/flightApi';
import BookingRedirect from './BookingRedirect';

// Airline code to full name mapping
const airlineNames = {
  IB: "Iberia",
  VY: "Vueling",
  AI: "Air India",
  IX: "Air India Express",
  SG: "SpiceJet",
  QP: "Akasa Air",
  "6E": "IndiGo",
  LH: "Lufthansa",
  BA: "British Airways",
  EK: "Emirates",
  UA: "United Airlines",
  AA: "American Airlines",
  AF: "Air France",
  KL: "KLM",
  TK: "Turkish Airlines",
  // Add more as needed
};
const getAirlineName = (code) => airlineNames[code] || code;

// Airline code to logo mapping (add more as needed)
const airlineLogos = {
  'AI': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Air_India_Logo.svg',
  '6E': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/IndiGo_Logo.svg',
  'SG': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SpiceJet_logo.svg',
  'QP': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Akasa_Air_logo.svg',
  'IX': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Air_India_Express_logo.svg',
  // International airlines
  'BA': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/British_Airways_Logo.svg',
  'AF': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Air_France_Logo_2016.svg',
  'LH': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Lufthansa_Logo_2018.svg',
  'EK': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Emirates_logo.svg',
  'UA': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/United_Airlines_Logo.svg',
  'AA': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/American_Airlines_logo_2013.svg',
  'TK': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Turkish_Airlines_logo_2018.svg',
  'KL': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/KLM_logo.svg',
  'QF': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Qantas_Airways_Logo.svg',
  'CX': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Cathay_Pacific_logo.svg',
  'SQ': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Singapore_Airlines_Logo.svg',
  'QR': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Qatar_Airways_Logo.svg',
  'EY': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Etihad_Airways_Logo.svg',
  'SU': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Aeroflot_logo.svg',
  'AC': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Air_Canada_Logo.svg',
  'DL': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Delta_Air_Lines_Logo.svg',
  'NH': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/All_Nippon_Airways_logo.svg',
  'JL': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Japan_Airlines_logo.svg',
  'AZ': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/ITA_Airways_logo.svg',
  'IB': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Iberia_logo.svg',
  'VY': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Vueling_logo.svg',
  // Add more as needed
};
const getAirlineLogo = (code) => airlineLogos[(code || '').toUpperCase().trim()] || null;

// Airline logo helper function
const getAirlineLogoUrl = (iataCode, width = 40, height = 40) => {
  if (!iataCode) return null;
  return `http://img.wway.io/pics/root/${iataCode}@png?exar=1&rs=fit:${width}:${height}`;
};

// Agency logo helper function  
const getAgencyLogoUrl = (agencyId, width = 110, height = 70) => {
  if (!agencyId) return null;
  return `http://img.wway.io/pics/as_gates/${agencyId}@png?exar=1&rs=fit:${width}:${height}`;
};

// Move formatDateTime to top-level scope
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date)) return isoString;
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
};

const splitDateTime = (dateTimeString) => {
  if (!dateTimeString) return { date: '', time: '' };
  const [date, time] = dateTimeString.split(' ');
  return { date, time };
};

const getDuration = (dep, arr) => {
  if (!dep || !arr) return '';
  const depDate = new Date(dep.replace(' ', 'T'));
  const arrDate = new Date(arr.replace(' ', 'T'));
  if (isNaN(depDate) || isNaN(arrDate)) return '';
  const diff = Math.abs(arrDate - depDate) / 60000; // in minutes
  const h = Math.floor(diff / 60);
  const m = Math.round(diff % 60);
  return `${h}h ${m}m`;
};

const ResultList = ({ results, type, loading, from, to, isStreaming, streamingProgress }) => {
  const [sortBy, setSortBy] = useState('price');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedFlight, setSelectedFlight] = useState(null); // For modal
  const [bookingData, setBookingData] = useState(null); // For booking redirect
  // Modal state for mobile filter
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    stops: {
      nonStop: false,
      oneStop: false
    },
    priceRange: {
      min: 0,
      max: 50000
    },
    departureTime: {
      earlyMorning: false,
      morning: false,
      midDay: false,
      night: false
    }
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Searching for {type}...</p>
        <p className="loading-subtitle">This may take a few moments for popular routes</p>
      </div>
    );
  }

  // Don't show "No flights found" during streaming - let the streaming indicator handle it
  if (!results || results.length === 0) {
    // If we're streaming, don't show "no results" message
    if (isStreaming) {
      return null; // Let the streaming indicator in the header show the status
    }
    
    return (
      <div className="no-results">
        <h3>No {type} found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    );
  }

  // Apply filters
  let filteredResults = results.filter(result => {
    // Platform filter
    if (filterPlatform !== 'all' && result.sourcePlatform !== filterPlatform) {
      return false;
    }

    // Route filter for flights
    if (type === 'flights' && from && to) {
      if (result.origin !== from || result.destination !== to) {
        return false;
      }
    }

    // Price range filter
    if (result.price < filters.priceRange.min || result.price > filters.priceRange.max) {
      return false;
    }

    // Departure time filter
    if (type === 'flights' && result.departureTime) {
      const depTime = splitDateTime(result.departureTime).time;
      const hour = parseInt(depTime.split(':')[0]);
      
      let timeMatches = false;
      if (filters.departureTime.earlyMorning && hour < 6) timeMatches = true;
      if (filters.departureTime.morning && hour >= 6 && hour < 12) timeMatches = true;
      if (filters.departureTime.midDay && hour >= 12 && hour < 18) timeMatches = true;
      if (filters.departureTime.night && hour >= 18) timeMatches = true;
      
      // If any time filter is selected, flight must match
      const hasTimeFilter = Object.values(filters.departureTime).some(v => v);
      if (hasTimeFilter && !timeMatches) {
        return false;
      }
    }

    return true;
  });

  // Sort results
  let sortedResults = [...filteredResults];
  switch (sortBy) {
    case 'price':
      sortedResults.sort((a, b) => a.price - b.price);
      break;
    case 'duration':
      if (type === 'flights') {
        sortedResults.sort((a, b) => {
          const durationA = getDuration(a.departureTime, a.arrivalTime);
          const durationB = getDuration(b.departureTime, b.arrivalTime);
          return durationA.localeCompare(durationB);
        });
      }
      break;
    case 'departure':
      if (type === 'flights') {
        sortedResults.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      }
      break;
    default:
      break;
  }

  const platforms = [...new Set(results.map(r => r.sourcePlatform).filter(Boolean))];

  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    RUB: '₽',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    // Add more as needed
  };

  const formatPrice = (price, currency = 'INR') => {
    if (typeof price !== 'number') return '';
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${price.toLocaleString('en-IN')}`;
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.replace(/(\d{2})(\d{2})/, '$1:$2');
  };

  const handleFilterChange = (filterType, key, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: {
        ...prev[filterType],
        [key]: value
      }
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      stops: {
        nonStop: false,
        oneStop: false
      },
      priceRange: {
        min: 0,
        max: 50000
      },
      departureTime: {
        earlyMorning: false,
        morning: false,
        midDay: false,
        night: false
      }
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters.stops).some(v => v) ||
           Object.values(filters.departureTime).some(v => v) ||
           filters.priceRange.min > 0 ||
           filters.priceRange.max < 50000;
  };

  // Handle booking button click
  const handleBookingClick = async (result) => {
    try {
      if (!result.bookingData) {
        alert('Booking data not available for this flight');
        return;
      }

      const response = await generateBookingLink(result.bookingData);
      
      if (response.success && response.bookingData) {
        setBookingData(response.bookingData);
      } else {
        alert('Unable to generate booking link. Please try again.');
      }
    } catch (error) {
      console.error('Error generating booking link:', error);
      alert('Error generating booking link. Please try again.');
    }
  };

  return (
    <div className="results-layout">
      {/* Filter Sidebar (desktop) or Modal (mobile) */}
      <div
        className={`filter-sidebar${showFilterModal ? ' show-mobile' : ''}`}
        style={{ display: showFilterModal ? 'block' : undefined }}
      >
        <div className="filter-header">
          <h3>Filters</h3>
          {(hasActiveFilters() || showFilterModal) && (
            <button
              className="clear-filters-btn"
              onClick={() => {
                clearAllFilters();
                if (showFilterModal) setShowFilterModal(false);
              }}
            >
              {showFilterModal ? 'Close' : 'Clear All'}
            </button>
          )}
        </div>

        {/* Stops Filter */}
        <div className="filter-section">
          <h4>Stops</h4>
          <div className="filter-options">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.stops.nonStop}
                onChange={(e) => handleFilterChange('stops', 'nonStop', e.target.checked)}
              />
              <span className="checkmark"></span>
              Non-Stop
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.stops.oneStop}
                onChange={(e) => handleFilterChange('stops', 'oneStop', e.target.checked)}
              />
              <span className="checkmark"></span>
              1 Stop
            </label>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="filter-section">
          <h4>Flight Price</h4>
          <div className="price-range">
            <div className="price-slider">
              <input
                type="range"
                min="0"
                max="50000"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', 'min', parseInt(e.target.value))}
                className="price-slider-min"
              />
              <input
                type="range"
                min="0"
                max="50000"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', 'max', parseInt(e.target.value))}
                className="price-slider-max"
              />
            </div>
            <div className="price-range-display">
              ₹{filters.priceRange.min.toLocaleString('en-IN')} - ₹{filters.priceRange.max.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Departure Time Filter */}
        <div className="filter-section">
          <h4>Departure from {from}</h4>
          <div className="filter-options">
            <label className="filter-checkbox time-filter">
              <input
                type="checkbox"
                checked={filters.departureTime.earlyMorning}
                onChange={(e) => handleFilterChange('departureTime', 'earlyMorning', e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="time-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
              <div className="time-text">
                <div>Early Morning</div>
                <div className="time-subtitle">Before 6AM</div>
              </div>
            </label>
            <label className="filter-checkbox time-filter">
              <input
                type="checkbox"
                checked={filters.departureTime.morning}
                onChange={(e) => handleFilterChange('departureTime', 'morning', e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="time-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                </svg>
              </span>
              <div className="time-text">
                <div>Morning</div>
                <div className="time-subtitle">6AM - 12PM</div>
              </div>
            </label>
            <label className="filter-checkbox time-filter">
              <input
                type="checkbox"
                checked={filters.departureTime.midDay}
                onChange={(e) => handleFilterChange('departureTime', 'midDay', e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="time-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
              <div className="time-text">
                <div>Mid Day</div>
                <div className="time-subtitle">12PM - 6PM</div>
              </div>
            </label>
            <label className="filter-checkbox time-filter">
              <input
                type="checkbox"
                checked={filters.departureTime.night}
                onChange={(e) => handleFilterChange('departureTime', 'night', e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="time-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
              </span>
              <div className="time-text">
                <div>Night</div>
                <div className="time-subtitle">After 6PM</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Modal overlay for mobile filter */}
      {showFilterModal && (
        <div className="filter-modal-overlay" onClick={() => setShowFilterModal(false)}></div>
      )}

      {/* Main Results Area */}
      <div className="results-main">
        <div className="results-header">
          <div className="results-info">
            <h2>{sortedResults.length} {type} found</h2>
            <p>Compare prices from multiple platforms</p>
          </div>
          
          <div className="results-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="price">Sort by Price</option>
              {type === 'hotels' && <option value="rating">Sort by Rating</option>}
              {type === 'flights' && <option value="duration">Sort by Duration</option>}
            </select>
            
            <select 
              value={filterPlatform} 
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="input"
            >
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown'}
                </option>
              ))}
            </select>
            
            {/* Filter Button for Mobile */}
            <button
              className="mobile-filter-btn"
              onClick={() => setShowFilterModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Route Headers for Round Trips */}
        {type === 'flights' && sortedResults.length > 0 && sortedResults[0].isRoundTrip && (
          <div className="round-trip-route-headers">
            <div className="route-header-panel">
              <h3>{sortedResults[0].onward.origin} - {sortedResults[0].onward.destination}</h3>
              <p>Onward Flight</p>
            </div>
            <div className="route-header-panel">
              <h3>{sortedResults[0].return.origin} - {sortedResults[0].return.destination}</h3>
              <p>Return Flight</p>
            </div>
          </div>
        )}

        <div className="results-grid">
          {sortedResults.map((result, index) => (
            <div key={index} className="result-card card">
              {type === 'flights' ? (
                <FlightCard 
                  result={result} 
                  formatPrice={formatPrice} 
                  onViewDetails={setSelectedFlight}
                  onBookingClick={handleBookingClick}
                  isCheapest={index === 0 && sortBy === 'price'}
                />
              ) : (
                <HotelCard result={result} formatPrice={formatPrice} />
              )}
            </div>
          ))}
          
          {/* Streaming indicator */}
          {isStreaming && (
            <div className="streaming-indicator-card">
              <div className="streaming-spinner"></div>
              <div className="streaming-text">
                <p>Finding more flights...</p>
                <p className="streaming-count">{streamingProgress.totalFound} flights found so far</p>
              </div>
            </div>
          )}
        </div>
                  {selectedFlight && (
            <FlightDetailsModal
              flight={selectedFlight} 
              onClose={() => setSelectedFlight(null)} 
              searchParams={{ from, to }} // Pass available search params for enhanced details
              formatPrice={formatPrice} // Pass the formatPrice function
            />
          )}

          {/* Booking Redirect Modal */}
          {bookingData && (
            <BookingRedirect
              bookingData={bookingData}
              onClose={() => setBookingData(null)}
            />
          )}
      </div>
    </div>
  );
};

const FlightCard = ({ result, formatPrice, onViewDetails, onBookingClick, isCheapest }) => {
  // Try TravelPayouts logo first, fallback to local logos
  const airlineLogoUrl = getAirlineLogoUrl(result.airline);
  const localLogo = getAirlineLogo(result.airline);
  const logo = airlineLogoUrl || localLogo;
  
  // Check if this is a round trip
  const isRoundTrip = result.isRoundTrip && result.onward && result.return;
  
    if (isRoundTrip) {
    // Round trip display as separate panels like in screenshot
    const onwardDep = splitDateTime(result.onward.departureTime);
    const onwardArr = splitDateTime(result.onward.arrivalTime);
    const returnDep = splitDateTime(result.return.departureTime);
    const returnArr = splitDateTime(result.return.arrivalTime);
    const onwardDuration = getDuration(result.onward.departureTime, result.onward.arrivalTime);
    const returnDuration = getDuration(result.return.departureTime, result.return.arrivalTime);

    return (
      <div className="round-trip-separate-panels">
        {/* Left Panel - Onward Flight */}
        <div className="flight-direction-panel">
          <div className="flight-card modern-flight-card-horizontal">
            {isCheapest && <div className="cheapest-tag">Cheapest</div>}
            {/* Left: Logo in its own column, vertically centered */}
            <div className="flight-card-col flight-card-col-logo">
              {logo && (
                <img 
                  src={logo} 
                  alt={result.airline} 
                  className="airline-logo prominent-airline-logo"
                  onError={(e) => {
                    // Fallback to local logo if TravelPayouts logo fails
                    if (airlineLogoUrl && e.target.src === airlineLogoUrl) {
                      e.target.src = localLogo || '';
                    }
                  }}
                />
              )}
            </div>
            {/* Airline name and flight number stacked */}
            <div className="flight-card-col flight-card-col-airline-info">
              <div className="airline-name prominent-airline-name">{getAirlineName(result.airline)}</div>
              <div className="flight-number-prominent">{result.onward.flightNumber}</div>
            </div>
            {/* Center: Times, duration, airports */}
            <div className="flight-card-col flight-card-col-center">
              <div className="flight-times-row-screenshot">
                <div className="flight-time-block-screenshot">
                  <div className="flight-time-bold">{onwardDep.time}</div>
                  <div className="flight-airport-bold">{result.onward.origin}</div>
                </div>
                <div className="flight-duration-block-screenshot">
                  <div className="flight-duration-line"></div>
                  <div className="flight-duration-bold">{onwardDuration}</div>
                  <div className="flight-nonstop-small">Non-stop</div>
                  <div className="flight-duration-line"></div>
                </div>
                <div className="flight-time-block-screenshot">
                  <div className="flight-time-bold">{onwardArr.time}</div>
                  <div className="flight-airport-bold">{result.onward.destination}</div>
                </div>
              </div>
              <div className="flight-date-row">
                <div className="flight-date">{onwardDep.date}</div>
                <div className="flight-date">{onwardArr.date}</div>
              </div>
            </div>
            {/* Right: Individual flight price */}
            <div className="flight-card-col flight-card-col-right">
              <div className="price price-large">
                <span className="amount">{formatPrice(Math.round(result.price / 2), result.currency)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Return Flight */}
        <div className="flight-direction-panel">
          <div className="flight-card modern-flight-card-horizontal">
            {isCheapest && <div className="cheapest-tag">Cheapest</div>}
            {/* Left: Logo in its own column, vertically centered */}
            <div className="flight-card-col flight-card-col-logo">
              {logo && (
                <img 
                  src={logo} 
                  alt={result.airline} 
                  className="airline-logo prominent-airline-logo"
                  onError={(e) => {
                    // Fallback to local logo if TravelPayouts logo fails
                    if (airlineLogoUrl && e.target.src === airlineLogoUrl) {
                      e.target.src = localLogo || '';
                    }
                  }}
                />
              )}
            </div>
            {/* Airline name and flight number stacked */}
            <div className="flight-card-col flight-card-col-airline-info">
              <div className="airline-name prominent-airline-name">{getAirlineName(result.airline)}</div>
              <div className="flight-number-prominent">{result.return.flightNumber}</div>
            </div>
            {/* Center: Times, duration, airports */}
            <div className="flight-card-col flight-card-col-center">
              <div className="flight-times-row-screenshot">
                <div className="flight-time-block-screenshot">
                  <div className="flight-time-bold">{returnDep.time}</div>
                  <div className="flight-airport-bold">{result.return.origin}</div>
                </div>
                <div className="flight-duration-block-screenshot">
                  <div className="flight-duration-line"></div>
                  <div className="flight-duration-bold">{returnDuration}</div>
                  <div className="flight-nonstop-small">Non-stop</div>
                  <div className="flight-duration-line"></div>
                </div>
                <div className="flight-time-block-screenshot">
                  <div className="flight-time-bold">{returnArr.time}</div>
                  <div className="flight-airport-bold">{result.return.destination}</div>
                </div>
              </div>
              <div className="flight-date-row">
                <div className="flight-date">{returnDep.date}</div>
                <div className="flight-date">{returnArr.date}</div>
              </div>
            </div>
            {/* Right: Individual flight price */}
            <div className="flight-card-col flight-card-col-right">
              <div className="price price-large">
                <span className="amount">{formatPrice(Math.round(result.price / 2), result.currency)}</span>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    );
  } else {
    // One-way flight display (existing logic)
    const dep = splitDateTime(result.departureTime);
    const arr = splitDateTime(result.arrivalTime);
    const duration = getDuration(result.departureTime, result.arrivalTime);
    
    return (
      <div className="flight-card modern-flight-card-horizontal">
        {isCheapest && <div className="cheapest-tag">Cheapest</div>}
        
        {/* Left: Logo in its own column, vertically centered */}
        <div className="flight-card-col flight-card-col-logo">
          {logo && (
            <img 
              src={logo} 
              alt={result.airline} 
              className="airline-logo prominent-airline-logo"
              onError={(e) => {
                // Fallback to local logo if TravelPayouts logo fails
                if (airlineLogoUrl && e.target.src === airlineLogoUrl) {
                  e.target.src = localLogo || '';
                }
              }}
            />
          )}
        </div>
        {/* Airline name and flight number stacked */}
        <div className="flight-card-col flight-card-col-airline-info">
          <div className="airline-name prominent-airline-name">{getAirlineName(result.airline)}</div>
          <div className="flight-number-prominent">{result.flightNumber}</div>
        </div>
        {/* Center: Times, duration, airports */}
        <div className="flight-card-col flight-card-col-center">
          <div className="flight-times-row-screenshot">
            <div className="flight-time-block-screenshot">
              <div className="flight-time-bold">{dep.time}</div>
              <div className="flight-airport-bold">{result.origin}</div>
            </div>
            <div className="flight-duration-block-screenshot">
              <div className="flight-duration-line"></div>
              <div className="flight-duration-bold">{duration}</div>
              <div className="flight-nonstop-small">Non-stop</div>
              <div className="flight-duration-line"></div>
            </div>
            <div className="flight-time-block-screenshot">
              <div className="flight-time-bold">{arr.time}</div>
              <div className="flight-airport-bold">{result.destination}</div>
            </div>
          </div>
          <div className="flight-date-row">
            <div className="flight-date">{dep.date}</div>
            <div className="flight-date">{arr.date}</div>
          </div>
        </div>
        {/* Right: Price, Book button, Flight Details */}
        <div className="flight-card-col flight-card-col-right">
          <div className="price price-large">
            <span className="amount">{formatPrice(result.price, result.currency)}</span>
          </div>
          {result.bookingData ? (
            <button
              className="btn btn-primary book-btn-horizontal"
              onClick={() => onBookingClick(result)}
            >
              Book
            </button>
          ) : (
            <div className="no-booking-available">
              <span>Booking not available</span>
            </div>
          )}
          <button className="flight-details-link" onClick={() => onViewDetails(result)}>
            <span className="flight-details-arrow">&gt;</span>
            Flight Details
          </button>
        </div>
      </div>
    );
  }
};

const HotelCard = ({ result, formatPrice }) => (
  <div className="hotel-card">
    <div className="hotel-image">
      <img src={result.imageUrl} alt={result.name} />
      <div className="platform-badge">
        {result.sourcePlatform}
      </div>
    </div>
    
    <div className="hotel-content">
      <div className="hotel-header">
        <h3>{result.name}</h3>
        {result.rating && (
          <div className="rating">
            <span className="stars">{'★'.repeat(Math.floor(result.rating))}</span>
            <span className="rating-text">{result.rating}/5</span>
          </div>
        )}
      </div>
      
      <p className="hotel-location">{result.location}</p>
      
      {result.amenities && result.amenities.length > 0 && (
        <div className="amenities">
          {result.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="amenity-tag">{amenity}</span>
          ))}
        </div>
      )}
      
      <div className="hotel-footer">
        <div className="price">
          <span className="amount">{formatPrice(result.price)}</span>
          <span className="per-night">per night</span>
        </div>
        <button className="btn btn-primary">Book Now</button>
      </div>
    </div>
  </div>
);

// Enhanced Modal for flight details
const FlightDetailsModal = ({ flight, onClose, searchParams, formatPrice }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [enhancedDetails, setEnhancedDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const isRoundTrip = flight.isRoundTrip && flight.onward && flight.return;

  // Fetch enhanced details when modal opens
  useEffect(() => {
    if (flight && searchParams) {
      fetchEnhancedDetails();
    }
  }, [flight, searchParams]);

  const fetchEnhancedDetails = async () => {
    // For now, we'll use basic details since we need to add proposalIndex and itemIndex to flight objects
    // This is a progressive enhancement - it will work with basic details if enhanced details fail
    if (!flight.proposalIndex || !flight.itemIndex) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFlightDetails(
        flight.proposalIndex, 
        flight.itemIndex, 
        searchParams
      );
      setEnhancedDetails(response.enhancedDetails);
    } catch (err) {
      setError('Failed to load detailed information');
      console.error('Error fetching enhanced details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.replace(/^(\d{2}):(\d{2})$/, (_, hours, minutes) => {
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getFlightDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'N/A';
    
    try {
      const dep = new Date(`${departure.date} ${departure.time}`);
      const arr = new Date(`${arrival.date} ${arrival.time}`);
      const diffMs = arr - dep;
      
      if (diffMs < 0) {
        // Flight arrives next day
        const nextDay = new Date(arr);
        nextDay.setDate(nextDay.getDate() + 1);
        const correctedDiffMs = nextDay - dep;
        return Math.floor(correctedDiffMs / (1000 * 60));
      }
      
      return Math.floor(diffMs / (1000 * 60));
    } catch (error) {
      return null;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderFlightDetails = () => {
    if (loading) {
      return <div className="loading">Loading detailed information...</div>;
    }

    if (error) {
      return <div className="error">Unable to load detailed information</div>;
    }

    if (!enhancedDetails) {
      return renderBasicDetails();
    }

    return renderEnhancedDetails();
  };

  const renderBasicDetails = () => (
    <div className="flight-details-basic">
      <div className="flight-summary">
        <h3>{flight.origin} → {flight.destination}</h3>
        <p className="flight-overview">
          {formatDate(flight.departureTime)} • Non-stop • {formatDuration(getFlightDuration(
            { date: flight.departureTime, time: flight.departureTime },
            { date: flight.arrivalTime, time: flight.arrivalTime }
          ))} • Economy
        </p>
        <div className="airline-info">
          <span className="airline-name">{getAirlineName(flight.airline)}</span>
          <span className="flight-number">| {flight.flightNumber}</span>
        </div>
      </div>

      <div className="flight-itinerary">
        <div className="departure-info">
          <div className="time">{formatTime(flight.departureTime)}</div>
          <div className="date">{formatDate(flight.departureTime)}</div>
          <div className="airport-code">{flight.origin}</div>
          <div className="airport-name">Airport Name</div>
        </div>
        
        <div className="flight-duration">
          <div className="duration-line">
            <span className="duration-text">{formatDuration(getFlightDuration(
              { date: flight.departureTime, time: flight.departureTime },
              { date: flight.arrivalTime, time: flight.arrivalTime }
            ))}</span>
          </div>
        </div>
        
        <div className="arrival-info">
          <div className="time">{formatTime(flight.arrivalTime)}</div>
          <div className="date">{formatDate(flight.arrivalTime)}</div>
          <div className="airport-code">{flight.destination}</div>
          <div className="airport-name">Airport Name</div>
        </div>
      </div>

      <div className="flight-amenities">
        <div className="amenities-left">
          <div className="amenity-item">
            <span className="amenity-icon">✈️</span>
            <span>Aircraft Type</span>
          </div>
          <div className="amenity-item">
            <span className="amenity-icon">💺</span>
            <span>Seat Layout</span>
          </div>
          <div className="amenity-item">
            <span className="amenity-icon">💺</span>
            <span>Standard 3-3 (Limited seat tilt)</span>
          </div>
        </div>
        
        <div className="amenities-right">
          <div className="baggage-info">
            <div className="baggage-item">
              <span className="baggage-icon">👜</span>
              <span>Cabin: 7 kg per adult</span>
            </div>
            <div className="baggage-item">
              <span className="baggage-icon">🧳</span>
              <span>Check-in: 15 kg per adult</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnhancedDetails = () => {
    const firstSegment = enhancedDetails.segments[0];
    const firstFlight = firstSegment?.flights[0];
    
    if (!firstFlight) return renderBasicDetails();

    return (
      <div className="flight-details-enhanced">
        <div className="flight-summary">
          <h3>{firstFlight.departure.airport} → {firstFlight.arrival.airport}</h3>
          <p className="flight-overview">
            {formatDate(firstFlight.departure.date)} • Non-stop • {formatDuration(firstFlight.duration)} • Economy
          </p>
          <div className="airline-info">
            <span className="airline-name">{getAirlineName(enhancedDetails.airline)}</span>
            <span className="flight-number">| {firstFlight.flightNumber}</span>
            <span className="on-time-badge">83% On-time</span>
          </div>
        </div>

        <div className="flight-itinerary">
          <div className="departure-info">
            <div className="time">{formatTime(firstFlight.departure.time)}</div>
            <div className="date">{formatDate(firstFlight.departure.date)}</div>
            <div className="airport-code">{firstFlight.departure.airport}</div>
            <div className="airport-name">Airport Name</div>
            {firstFlight.departure.terminal && (
              <div className="terminal">Terminal {firstFlight.departure.terminal}</div>
            )}
          </div>
          
          <div className="flight-duration">
            <div className="duration-line">
              <span className="duration-text">{formatDuration(firstFlight.duration)}</span>
            </div>
          </div>
          
          <div className="arrival-info">
            <div className="time">{formatTime(firstFlight.arrival.time)}</div>
            <div className="date">{formatDate(firstFlight.arrival.date)}</div>
            <div className="airport-code">{firstFlight.arrival.airport}</div>
            <div className="airport-name">Airport Name</div>
            {firstFlight.arrival.terminal && (
              <div className="terminal">Terminal {firstFlight.arrival.terminal}</div>
            )}
          </div>
        </div>

        <div className="flight-amenities">
          <div className="amenities-left">
            <div className="amenity-item">
              <span className="amenity-icon">✈️</span>
              <span>{firstFlight.aircraft.type || 'Aircraft Type'}</span>
            </div>
            <div className="amenity-item">
              <span className="amenity-icon">💺</span>
              <span>Narrow</span>
            </div>
            <div className="amenity-item">
              <span className="amenity-icon">💺</span>
              <span>Standard 3-3 (Limited seat tilt)</span>
            </div>
            {firstFlight.wifi && (
              <div className="amenity-item">
                <span className="amenity-icon">📶</span>
                <span>WiFi Available</span>
              </div>
            )}
            {firstFlight.powerOutlets && (
              <div className="amenity-item">
                <span className="amenity-icon">🔌</span>
                <span>Power Outlets</span>
              </div>
            )}
          </div>
          
          <div className="amenities-right">
            <div className="baggage-info">
              {enhancedDetails.baggage?.cabinBaggage?.map((baggage, index) => (
                <div key={index} className="baggage-item">
                  <span className="baggage-icon">👜</span>
                  <span>Cabin: {baggage}</span>
                </div>
              ))}
              {enhancedDetails.baggage?.checkedBaggage?.map((baggage, index) => (
                <div key={index} className="baggage-item">
                  <span className="baggage-icon">🧳</span>
                  <span>Check-in: {baggage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPricingOptions = () => {
    // Check if flight has multiple pricing options
    if (flight.pricingOptions && flight.pricingOptions.length > 1) {
      return (
        <div className="pricing-options-container">
                     <h3>Pricing Options</h3>
           <p>Choose from multiple booking options (sorted by price):</p>
          
          {flight.pricingOptions.map((option, index) => (
            <div key={index} className="pricing-option-card">
              <div className="pricing-option-header">
                                 <div className="agency-info">
                   <h4>{index === 0 ? 'Best Price' : `Option ${index + 1}`}</h4>
                   {option.fareFamily && (
                     <span className="fare-family">{option.fareFamily}</span>
                   )}
                 </div>
                <div className="price-info">
                  <div className="price-amount">{formatPrice(option.priceINR, 'INR')}</div>
                  <div className="original-price">{formatPrice(option.price, option.currency)}</div>
                </div>
              </div>
              
              <div className="pricing-option-details">
                <div className="fare-features">
                  {option.refundable && <span className="feature refundable">Refundable</span>}
                  {option.changeable && <span className="feature changeable">Changeable</span>}
                </div>
                
                <div className="booking-action">
                                     <a 
                     href={option.bookingUrl} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="book-option-btn"
                   >
                     Book Now
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="pricing-options-container">
          <h3>Pricing Options</h3>
          <p>Currently showing the best available price. Multiple agency options will be displayed here when available.</p>
          <div className="single-price-display">
            <div className="price-amount">{formatPrice(flight.price, flight.currency)}</div>
            <a 
              href={flight.bookingLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="book-option-btn"
            >
              Book Now
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content enhanced-modal">
        <div className="modal-header">
          <div className="modal-tabs">
            <button 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Flight Details
            </button>
            <button 
              className={`tab ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={() => setActiveTab('pricing')}
            >
              Pricing Options
            </button>
            <button 
              className={`tab ${activeTab === 'cancellation' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancellation')}
            >
              Cancellation
            </button>
            <button 
              className={`tab ${activeTab === 'rescheduling' ? 'active' : ''}`}
              onClick={() => setActiveTab('rescheduling')}
            >
              Rescheduling
            </button>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {activeTab === 'details' && renderFlightDetails()}
          {activeTab === 'pricing' && renderPricingOptions()}
          {activeTab === 'cancellation' && (
            <div className="tab-content">
              <h3>Cancellation Policy</h3>
              <p>Detailed cancellation information will be displayed here.</p>
            </div>
          )}
          {activeTab === 'rescheduling' && (
            <div className="tab-content">
              <h3>Rescheduling Policy</h3>
              <p>Detailed rescheduling information will be displayed here.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="book-btn">
            Book
          </button>
          <div className="price-info">
            <div className="total-price">{formatPrice(flight.price, flight.currency)}</div>
            <div className="discount">Extra ₹530 Off</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultList; 