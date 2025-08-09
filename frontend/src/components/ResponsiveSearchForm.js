import React, { useState, useRef, useEffect } from 'react';
import './SearchForm.css';
import swapVert from '../assets/swap-vert-svgrepo-com.svg';
import m from './ResponsiveSearchForm.mobile.module.css';
import d from './ResponsiveSearchForm.desktop.module.css';

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
  { code: 'ORD', city: 'Chicago', name: "O'Hare International Airport", country: 'USA' },
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
  { code: 'LOS', city: 'Lagos', name: 'Murtala Muhammed International Airport', country: 'Nigeria' },
  { code: 'ADD', city: 'Addis Ababa', name: 'Bole International Airport', country: 'Ethiopia' },
  { code: 'DAR', city: 'Dar es Salaam', name: 'Julius Nyerere International Airport', country: 'Tanzania' },
  { code: 'KGL', city: 'Kigali', name: 'Kigali International Airport', country: 'Rwanda' },
  { code: 'KRT', city: 'Khartoum', name: 'Khartoum International Airport', country: 'Sudan' },
  { code: 'CMN', city: 'Casablanca', name: 'Mohammed V International Airport', country: 'Morocco' },
  { code: 'ALG', city: 'Algiers', name: 'Houari Boumediene Airport', country: 'Algeria' },
  { code: 'TUN', city: 'Tunis', name: 'Carthage International Airport', country: 'Tunisia' },
  { code: 'LUN', city: 'Lusaka', name: 'Kenneth Kaunda International Airport', country: 'Zambia' },
  { code: 'HRE', city: 'Harare', name: 'Robert Gabriel Mugabe International Airport', country: 'Zimbabwe' },
  { code: 'GBE', city: 'Gaborone', name: 'Sir Seretse Khama International Airport', country: 'Botswana' },
  { code: 'WDH', city: 'Windhoek', name: 'Hosea Kutako International Airport', country: 'Namibia' },
  { code: 'MPM', city: 'Maputo', name: 'Maputo International Airport', country: 'Mozambique' },
  { code: 'BJM', city: 'Bujumbura', name: 'Bujumbura International Airport', country: 'Burundi' },
  { code: 'BGF', city: 'Bangui', name: 'Bangui MPoko International Airport', country: 'Central African Republic' },
  { code: 'NDJ', city: 'NDjamena', name: 'NDjamena International Airport', country: 'Chad' },
  { code: 'BZV', city: 'Brazzaville', name: 'Maya-Maya Airport', country: 'Republic of the Congo' },
  { code: 'FIH', city: 'Kinshasa', name: 'NDjili Airport', country: 'Democratic Republic of the Congo' },
  { code: 'SSA', city: 'Salvador', name: 'Deputado Luís Eduardo Magalhães International Airport', country: 'Brazil' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Galeão International Airport', country: 'Brazil' },
  { code: 'GRU', city: 'São Paulo', name: 'Guarulhos International Airport', country: 'Brazil' },
  { code: 'BSB', city: 'Brasília', name: 'Brasília International Airport', country: 'Brazil' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini International Airport', country: 'Argentina' },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benítez International Airport', country: 'Chile' },
  { code: 'LIM', city: 'Lima', name: 'Jorge Chávez International Airport', country: 'Peru' },
  { code: 'BOG', city: 'Bogotá', name: 'El Dorado International Airport', country: 'Colombia' },
  { code: 'UIO', city: 'Quito', name: 'Mariscal Sucre International Airport', country: 'Ecuador' },
  { code: 'CCS', city: 'Caracas', name: 'Simón Bolívar International Airport', country: 'Venezuela' },
  { code: 'ASU', city: 'Asunción', name: 'Silvio Pettirossi International Airport', country: 'Paraguay' },
  { code: 'MVD', city: 'Montevideo', name: 'Carrasco International Airport', country: 'Uruguay' },
  { code: 'LPB', city: 'La Paz', name: 'El Alto International Airport', country: 'Bolivia' },
  { code: 'GUA', city: 'Guatemala City', name: 'La Aurora International Airport', country: 'Guatemala' },
  { code: 'SAL', city: 'San Salvador', name: 'Óscar Arnulfo Romero International Airport', country: 'El Salvador' },
  { code: 'TGU', city: 'Tegucigalpa', name: 'Toncontín International Airport', country: 'Honduras' },
  { code: 'MGA', city: 'Managua', name: 'Augusto C. Sandino International Airport', country: 'Nicaragua' },
  { code: 'SJO', city: 'San José', name: 'Juan Santamaría International Airport', country: 'Costa Rica' },
  { code: 'PTY', city: 'Panama City', name: 'Tocumen International Airport', country: 'Panama' },
  { code: 'HAV', city: 'Havana', name: 'José Martí International Airport', country: 'Cuba' },
  { code: 'SDQ', city: 'Santo Domingo', name: 'Las Américas International Airport', country: 'Dominican Republic' },
  { code: 'KIN', city: 'Kingston', name: 'Norman Manley International Airport', country: 'Jamaica' },
  { code: 'NAS', city: 'Nassau', name: 'Lynden Pindling International Airport', country: 'Bahamas' },
  { code: 'BGI', city: 'Bridgetown', name: 'Grantley Adams International Airport', country: 'Barbados' },
  { code: 'POS', city: 'Port of Spain', name: 'Piarco International Airport', country: 'Trinidad and Tobago' },
  { code: 'GEO', city: 'Georgetown', name: 'Cheddi Jagan International Airport', country: 'Guyana' },
  { code: 'PBM', city: 'Paramaribo', name: 'Johan Adolf Pengel International Airport', country: 'Suriname' },
  { code: 'CAY', city: 'Cayenne', name: 'Cayenne – Félix Eboué Airport', country: 'French Guiana' },
  { code: 'BEL', city: 'Belém', name: 'Val de Cans International Airport', country: 'Brazil' },
  { code: 'MAO', city: 'Manaus', name: 'Eduardo Gomes International Airport', country: 'Brazil' },
  { code: 'FOR', city: 'Fortaleza', name: 'Pinto Martins International Airport', country: 'Brazil' },
  { code: 'REC', city: 'Recife', name: 'Guararapes International Airport', country: 'Brazil' },
  { code: 'NAT', city: 'Natal', name: 'Augusto Severo International Airport', country: 'Brazil' },
  { code: 'JOI', city: 'Joinville', name: 'Joinville-Lauro Carneiro de Loyola Airport', country: 'Brazil' },
  { code: 'CWB', city: 'Curitiba', name: 'Afonso Pena International Airport', country: 'Brazil' },
  { code: 'POA', city: 'Porto Alegre', name: 'Salgado Filho International Airport', country: 'Brazil' },
  { code: 'FLN', city: 'Florianópolis', name: 'Hercílio Luz International Airport', country: 'Brazil' },
  { code: 'CGR', city: 'Campo Grande', name: 'Campo Grande International Airport', country: 'Brazil' },
  { code: 'CGB', city: 'Cuiabá', name: 'Marechal Rondon International Airport', country: 'Brazil' }
];

// Helper to get today's local date in YYYY-MM-DD
const todayLocal = () => {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().split('T')[0];
};

const ResponsiveSearchForm = ({ onSearch }) => {
  // Track mobile viewport to stabilize inline mobile-only styles
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else {
      // Safari/older
      mql.addListener(handler);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, []);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: todayLocal(),
    return_date: '',
    adults: '1',
    tripType: 'one-way'
  });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const filterAirports = (searchTerm) => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    
    return popularAirports
      .map(airport => {
        const code = airport.code.toLowerCase();
        const city = airport.city.toLowerCase();
        const name = airport.name.toLowerCase();
        
        // Calculate match score
        let score = 0;
        
        // Exact matches get highest priority
        if (code === term) score += 1000;
        if (city === term) score += 1000;
        if (name === term) score += 1000;
        
        // Matches that start with the term get high priority
        if (code.startsWith(term)) score += 500;
        if (city.startsWith(term)) score += 500;
        if (name.startsWith(term)) score += 500;
        
        // Partial matches get lower priority
        if (code.includes(term)) score += 100;
        if (city.includes(term)) score += 100;
        if (name.includes(term)) score += 100;
        
        return { ...airport, score };
      })
      .filter(airport => airport.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...airport }) => airport)
      .slice(0, 10);
  };

  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, from: value }));
    
    if (value.length >= 2) {
      const suggestions = filterAirports(value);
      setFromSuggestions(suggestions);
      setShowFromDropdown(true);
    } else {
      setFromSuggestions([]);
      setShowFromDropdown(false);
    }
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, to: value }));
    
    if (value.length >= 2) {
      const suggestions = filterAirports(value);
      setToSuggestions(suggestions);
      setShowToDropdown(true);
    } else {
      setToSuggestions([]);
      setShowToDropdown(false);
    }
  };

  const handleFromSelect = (airport) => {
    setFormData(prev => ({ ...prev, from: airport.code }));
    setFromSuggestions([]);
    setShowFromDropdown(false);
  };

  const handleToSelect = (airport) => {
    setFormData(prev => ({ ...prev, to: airport.code }));
    setToSuggestions([]);
    setShowToDropdown(false);
  };

  const handleSwap = () => {
    setFormData(prev => ({ ...prev, from: prev.to, to: prev.from }));
  };

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
    <div className={`${m.root} ${d.root} search-form-container`}>
      {/* Hero Text Section */}
      <div className={`${m.heroTextSection} ${d.heroTextSection} hero-text-section`}>
        <h1 className={`${m.heroTitle} ${d.heroTitle} hero-title`}>Find & Book Your Perfect Trip</h1>
        <p className={`${m.heroSubtitle} ${d.heroSubtitle} hero-subtitle`}>Compare prices from hundreds of travel sites and book flights, hotels, and cars at the best rates</p>
      </div>

      <form onSubmit={handleSubmit} className={`${m.form} ${d.form} search-form`}>
        <div className={`${m.tripTypeSelector} ${d.tripTypeSelector} trip-type-selector`}>
          <select
            id="tripType"
            className={`${d.tripTypeDropdown} trip-type-dropdown`}
            value={formData.tripType}
            onChange={(e) => handleTripTypeChange(e.target.value)}
            aria-label="Trip type"
          >
            <option value="one-way">One way</option>
            <option value="round-trip">Round trip</option>
          </select>
        </div>

        <div className={`${m.formRow} ${d.formRow} ${m.mobileCard} ${d.mobileCard} form-row mobile-card`}>
          <div className={`${m.formGroup} ${d.formGroup} form-group`}>
            <div className={`${m.inputContainer} ${d.inputContainer} input-container input-with-icon`} ref={fromInputRef}>
              <span className={`${m.fieldLabel} ${d.fieldLabel} field-label`}>FROM</span>
              <span className={`${m.inputIcon} ${d.inputIcon} input-icon from-icon`} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="6.5" stroke="#6b7280" strokeWidth="1.5" fill="none" />
                </svg>
              </span>
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
                <div className={`${m.airportDropdown} ${d.airportDropdown} airport-dropdown`}>
                  <div className={`${m.dropdownHeader} ${d.dropdownHeader} dropdown-header`}>
                    <h4>Popular Airports</h4>
                  </div>
                  {fromSuggestions.length > 0 ? (
                    fromSuggestions.map((airport, index) => (
                      <div
                        key={airport.code}
                        className={`${m.airportOption} ${d.airportOption} airport-option`}
                        onClick={() => handleFromSelect(airport)}
                      >
                        <div className={`${m.airportCode} ${d.airportCode} airport-code`}>{airport.code}</div>
                        <div className={`${m.airportDetails} ${d.airportDetails} airport-details`}>
                          <div className={`${m.airportCity} ${d.airportCity} airport-city`}>{airport.city}</div>
                          <div className={`${m.airportName} ${d.airportName} airport-name`}>{airport.name}</div>
                          {airport.country && <div className={`${m.airportCountry} ${d.airportCountry} airport-country`}>{airport.country}</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`${m.noResults} ${d.noResults} no-results`}>No airports found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className={`${m.swapCenter} ${d.swapCenter} swap-center`}
          >
            <button
              type="button"
              className={`${m.swapButton} ${m.swapMobilePinned} ${d.swapButton} swap-button`}
              onClick={handleSwap}
              aria-label="Swap From and To"
              style={isMobile ? { position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 2 } : undefined}
            >
              <img src={swapVert} className={`${m.swapIcon} ${d.swapIcon} swap-icon`} width="18" height="18" alt="" aria-hidden="true" />
            </button>
          </div>

          <div className={`${m.formGroup} ${d.formGroup} form-group`}>
            <div className={`${m.inputContainer} ${d.inputContainer} input-container input-with-icon`} ref={toInputRef}>
              <span className={`${m.fieldLabel} ${d.fieldLabel} field-label`}>TO</span>
              <span className={`${m.inputIcon} ${d.inputIcon} input-icon to-icon`} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21s-7-6.48-7-11a7 7 0 1114 0c0 4.52-7 11-7 11z" stroke="#6b7280" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="2.5" stroke="#6b7280" strokeWidth="1.5" fill="none" />
                </svg>
              </span>
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
                <div className={`${m.airportDropdown} ${d.airportDropdown} airport-dropdown`}>
                  <div className={`${m.dropdownHeader} ${d.dropdownHeader} dropdown-header`}>
                    <h4>Popular Airports</h4>
                  </div>
                  {toSuggestions.length > 0 ? (
                    toSuggestions.map((airport, index) => (
                      <div
                        key={airport.code}
                        className={`${m.airportOption} ${d.airportOption} airport-option`}
                        onClick={() => handleToSelect(airport)}
                      >
                        <div className={`${m.airportCode} ${d.airportCode} airport-code`}>{airport.code}</div>
                        <div className={`${m.airportDetails} ${d.airportDetails} airport-details`}>
                          <div className={`${m.airportCity} ${d.airportCity} airport-city`}>{airport.city}</div>
                          <div className={`${m.airportName} ${d.airportName} airport-name`}>{airport.name}</div>
                          {airport.country && <div className={`${m.airportCountry} ${d.airportCountry} airport-country`}>{airport.country}</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`${m.noResults} ${d.noResults} no-results`}>No airports found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${m.formRow} ${d.formRow} ${m.mobileSubcard} ${d.mobileSubcard} form-row mobile-subcard`}>
          <div className={`${m.formGroup} ${d.formGroup} form-group`}>
            <div className={`${m.inputContainer} ${d.inputContainer} input-container`}>
              <span className={`${m.fieldLabel} ${d.fieldLabel} field-label`}>DEPARTURE</span>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {formData.tripType === 'round-trip' && (
            <div className={`${m.formGroup} ${d.formGroup} form-group`}>
              <div className={`${m.inputContainer} ${d.inputContainer} input-container`}>
                <span className={`${m.fieldLabel} ${d.fieldLabel} field-label`}>RETURN</span>
                <input
                  type="date"
                  id="return_date"
                  name="return_date"
                  value={formData.return_date}
                  onChange={handleInputChange}
                  required
                  disabled={formData.tripType !== 'round-trip'}
                />
              </div>
            </div>
          )}

          <div className={`${m.formGroup} ${d.formGroup} form-group`}>
            <div className={`${m.inputContainer} ${d.inputContainer} input-container`}>
              <span className={`${m.fieldLabel} ${d.fieldLabel} field-label`}>PASSENGERS</span>
              <select
                id="adults"
                name="adults"
                value={formData.adults}
                onChange={handleInputChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className={`${m.searchBtn} ${d.searchBtn} search-btn`}>
            Search Flights
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResponsiveSearchForm;
