import React, { useState, useRef, useEffect } from 'react';
import './SearchForm.css';

// Popular airports data (Indian + International)
const popularAirports = [
  // Indian Airports
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport', country: 'India' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', country: 'India' },
  { code: 'GOI', city: 'Goa', name: 'Goa International Airport', country: 'India' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport', country: 'India' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport', country: 'India' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', country: 'India' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International Airport', country: 'India' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International Airport', country: 'India' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan Airport', country: 'India' },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International Airport', country: 'India' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh Airport', country: 'India' },
  { code: 'SXR', city: 'Srinagar', name: 'Srinagar Airport', country: 'India' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International Airport', country: 'India' },
  { code: 'IXZ', city: 'Port Blair', name: 'Veer Savarkar International Airport', country: 'India' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport', country: 'India' },
  
  // International Airports - Asia
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International Airport', country: 'UAE' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport', country: 'China' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong International Airport', country: 'China' },
  { code: 'KTM', city: 'Kathmandu', name: 'Tribhuvan International Airport', country: 'Nepal' },
  { code: 'CMB', city: 'Colombo', name: 'Bandaranaike International Airport', country: 'Sri Lanka' },
  { code: 'DAC', city: 'Dhaka', name: 'Hazrat Shahjalal International Airport', country: 'Bangladesh' },
  { code: 'ISB', city: 'Islamabad', name: 'Islamabad International Airport', country: 'Pakistan' },
  { code: 'KHI', city: 'Karachi', name: 'Jinnah International Airport', country: 'Pakistan' },
  { code: 'LHE', city: 'Lahore', name: 'Allama Iqbal International Airport', country: 'Pakistan' },
  
  // International Airports - Europe
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK' },
  { code: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'UK' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol Airport', country: 'Netherlands' },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas Airport', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'El Prat Airport', country: 'Spain' },
  { code: 'FCO', city: 'Rome', name: 'Fiumicino Airport', country: 'Italy' },
  { code: 'MXP', city: 'Milan', name: 'Malpensa Airport', country: 'Italy' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna International Airport', country: 'Austria' },
  { code: 'ARN', city: 'Stockholm', name: 'Arlanda Airport', country: 'Sweden' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Airport', country: 'Norway' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki Airport', country: 'Finland' },
  { code: 'WAW', city: 'Warsaw', name: 'Chopin Airport', country: 'Poland' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel Airport', country: 'Czech Republic' },
  { code: 'BUD', city: 'Budapest', name: 'Ferenc Liszt Airport', country: 'Hungary' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
  { code: 'ATH', city: 'Athens', name: 'Athens International Airport', country: 'Greece' },
  { code: 'LIS', city: 'Lisbon', name: 'Portela Airport', country: 'Portugal' },
  { code: 'OPO', city: 'Porto', name: 'Francisco Sá Carneiro Airport', country: 'Portugal' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium' },
  { code: 'LUX', city: 'Luxembourg', name: 'Luxembourg Airport', country: 'Luxembourg' },
  
  // International Airports - North America
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty International Airport', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },
  { code: 'ORD', city: 'Chicago', name: 'O\'Hare International Airport', country: 'USA' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport', country: 'USA' },
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', country: 'USA' },
  { code: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'USA' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'USA' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International Airport', country: 'USA' },
  { code: 'BOS', city: 'Boston', name: 'Logan International Airport', country: 'USA' },
  { code: 'IAD', city: 'Washington', name: 'Dulles International Airport', country: 'USA' },
  { code: 'YYZ', city: 'Toronto', name: 'Pearson International Airport', country: 'Canada' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada' },
  { code: 'YUL', city: 'Montreal', name: 'Montréal-Trudeau International Airport', country: 'Canada' },
  { code: 'MEX', city: 'Mexico City', name: 'Benito Juárez International Airport', country: 'Mexico' },
  
  // International Airports - Australia & Oceania
  { code: 'SYD', city: 'Sydney', name: 'Sydney Airport', country: 'Australia' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
  { code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport', country: 'Australia' },
  { code: 'PER', city: 'Perth', name: 'Perth Airport', country: 'Australia' },
  { code: 'ADL', city: 'Adelaide', name: 'Adelaide Airport', country: 'Australia' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand' },
  { code: 'WLG', city: 'Wellington', name: 'Wellington Airport', country: 'New Zealand' },
  
  // International Airports - Africa
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International Airport', country: 'South Africa' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International Airport', country: 'South Africa' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International Airport', country: 'Egypt' },
  { code: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta International Airport', country: 'Kenya' },
  { code: 'LAG', city: 'Lagos', name: 'Murtala Muhammed International Airport', country: 'Nigeria' },
  { code: 'ADD', city: 'Addis Ababa', name: 'Bole International Airport', country: 'Ethiopia' },
  { code: 'DAR', city: 'Dar es Salaam', name: 'Julius Nyerere International Airport', country: 'Tanzania' },
  { code: 'KRT', city: 'Khartoum', name: 'Khartoum International Airport', country: 'Sudan' },
  { code: 'CMN', city: 'Casablanca', name: 'Mohammed V International Airport', country: 'Morocco' },
  { code: 'TUN', city: 'Tunis', name: 'Carthage International Airport', country: 'Tunisia' },
  { code: 'ALG', city: 'Algiers', name: 'Houari Boumediene Airport', country: 'Algeria' }
];

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    return_date: '',
    adults: 1,
    tripType: 'one-way'
  });

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  // Filter airports based on search input
  const filterAirports = (searchTerm) => {
    if (!searchTerm) return popularAirports;
    
    const term = searchTerm.toLowerCase();
    return popularAirports.filter(airport => 
      airport.code.toLowerCase().includes(term) ||
      airport.city.toLowerCase().includes(term) ||
      airport.name.toLowerCase().includes(term) ||
      (airport.country && airport.country.toLowerCase().includes(term))
    );
  };

  // Handle input changes for From field
  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, from: value }));
    
    if (value.length > 0) {
      const filtered = filterAirports(value);
      setFromSuggestions(filtered);
      setShowFromDropdown(true);
    } else {
      setShowFromDropdown(false);
      setFromSuggestions([]);
    }
  };

  // Handle input changes for To field
  const handleToInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, to: value }));
    
    if (value.length > 0) {
      const filtered = filterAirports(value);
      setToSuggestions(filtered);
      setShowToDropdown(true);
    } else {
      setShowToDropdown(false);
      setToSuggestions([]);
    }
  };

  // Handle airport selection for From field
  const handleFromSelect = (airport) => {
    setFormData(prev => ({ ...prev, from: airport.code }));
    setSelectedFrom(airport);
    setShowFromDropdown(false);
    setFromSuggestions([]);
  };

  // Handle airport selection for To field
  const handleToSelect = (airport) => {
    setFormData(prev => ({ ...prev, to: airport.code }));
    setSelectedTo(airport);
    setShowToDropdown(false);
    setToSuggestions([]);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromInputRef.current && !fromInputRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }
      if (toInputRef.current && !toInputRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTripTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      tripType: type,
      return_date: type === 'one-way' ? '' : prev.return_date
    }));
  };

  return (
    <div className="search-form-container">
      {/* Logo Section */}
      <div className="logo-section">
        <div className="logo">
          <div className="airplane-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1 className="logo-title">MyTrippers</h1>
            <p className="logo-tagline">ALL FLIGHTS. ONE PLACE.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="trip-type-selector">
          <button
            type="button"
            className={`trip-type-btn ${formData.tripType === 'one-way' ? 'active' : ''}`}
            onClick={() => handleTripTypeChange('one-way')}
          >
            One Way
          </button>
          <button
            type="button"
            className={`trip-type-btn ${formData.tripType === 'round-trip' ? 'active' : ''}`}
            onClick={() => handleTripTypeChange('round-trip')}
          >
            Round Trip
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="from">From</label>
            <div className="input-container" ref={fromInputRef}>
              <input
                type="text"
                id="from"
                name="from"
                value={formData.from}
                onChange={handleFromInputChange}
                placeholder="Search city or airport"
                required
                autoComplete="off"
              />
              {showFromDropdown && (
                <div className="airport-dropdown">
                  <div className="dropdown-header">
                    <h4>Popular Airports</h4>
                  </div>
                  {fromSuggestions.length > 0 ? (
                    fromSuggestions.map((airport, index) => (
                      <div
                        key={airport.code}
                        className="airport-option"
                        onClick={() => handleFromSelect(airport)}
                      >
                        <div className="airport-code">{airport.code}</div>
                        <div className="airport-details">
                          <div className="airport-city">{airport.city}</div>
                          <div className="airport-name">{airport.name}</div>
                          {airport.country && <div className="airport-country">{airport.country}</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No airports found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="to">To</label>
            <div className="input-container" ref={toInputRef}>
              <input
                type="text"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleToInputChange}
                placeholder="Search city or airport"
                required
                autoComplete="off"
              />
              {showToDropdown && (
                <div className="airport-dropdown">
                  <div className="dropdown-header">
                    <h4>Popular Airports</h4>
                  </div>
                  {toSuggestions.length > 0 ? (
                    toSuggestions.map((airport, index) => (
                      <div
                        key={airport.code}
                        className="airport-option"
                        onClick={() => handleToSelect(airport)}
                      >
                        <div className="airport-code">{airport.code}</div>
                        <div className="airport-details">
                          <div className="airport-city">{airport.city}</div>
                          <div className="airport-name">{airport.name}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No airports found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Departure Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          {formData.tripType === 'round-trip' && (
            <div className="form-group">
              <label htmlFor="return_date">Return Date</label>
              <input
                type="date"
                id="return_date"
                name="return_date"
                value={formData.return_date}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="adults">Passengers</label>
            <select
              id="adults"
              name="adults"
              value={formData.adults}
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="search-btn">
          Search Flights
        </button>
      </form>
    </div>
  );
};

export default SearchForm; 