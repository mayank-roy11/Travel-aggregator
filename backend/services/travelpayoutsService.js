const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = 'https://api.travelpayouts.com/v1/flight_search';
const RESULTS_URL = 'https://api.travelpayouts.com/v1/flight_search_results';

// Generate signature for Travelpayouts v1 API as per official documentation
const generateSignature = (params, token) => {
    // 1. Sort top-level keys (excluding nested objects/arrays)
    // 2. For passengers, sort keys alphabetically: adults, children, infants
    // 3. For segments (array), for each object, use keys in order: date, destination, origin
    // 4. Concatenate only the values in the sorted order, separated by a colon
    // 5. Prepend the token and a colon
    // 6. Hash with MD5

    // Top-level keys to include (sorted): host, locale, marker, passengers, segments, trip_class, user_ip
    const values = [];
    // host
    values.push(params.host);
    // locale
    values.push(params.locale);
    // marker
    values.push(params.marker);
    // passengers (adults, children, infants)
    if (params.passengers) {
        values.push(params.passengers.adults);
        values.push(params.passengers.children);
        values.push(params.passengers.infants);
    }
    // segments (for each, date, destination, origin)
    if (Array.isArray(params.segments)) {
        params.segments.forEach(seg => {
            values.push(seg.date);
            values.push(seg.destination);
            values.push(seg.origin);
        });
    }
    // trip_class
    values.push(params.trip_class);
    // user_ip
    values.push(params.user_ip);

    // Build the string: token + ':' + values.join(':')
    const stringToHash = token + ':' + values.join(':');
    const signature = crypto.createHash('md5').update(stringToHash).digest('hex');
    return signature;
};

// Helper to fetch public IP
const getPublicIP = async () => {
    try {
        const res = await axios.get('https://api.ipify.org?format=json');
        return res.data.ip;
    } catch (err) {
        console.error('Failed to fetch public IP, defaulting to 127.0.0.1');
        return '127.0.0.1';
    }
};

// Two-step search: POST to init, then poll GET for results
const searchFlightsRealtime = async (origin, destination, departure_date, return_date, adults) => {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    const marker = process.env.TRAVELPAYOUTS_MARKER;
    const host = process.env.TRAVELPAYOUTS_HOST || 'localhost';

    // Fetch public IP for user_ip
    const user_ip = await getPublicIP();

    // Build request body as per docs, with signature as the first property
    const params = {
        signature: '', // placeholder, will set after generation
        host,
        marker,
        user_ip,
        locale: 'en',
        trip_class: 'Y',
        passengers: {
            adults: adults || 1,
            children: 0,
            infants: 0
        },
        segments: [
            { origin, destination, date: departure_date }
        ]
    };
    if (return_date) {
        params.segments.push({ origin: destination, destination: origin, date: return_date });
    }
    // Generate signature for the params (excluding the placeholder)
    params.signature = generateSignature(params, token);

    const headers = {
        'Content-Type': 'application/json'
    };

    // Step 1: POST to initialize search
    let searchId;
    try {
        const response = await axios.post(API_URL, params, { headers });
        searchId = response.data.search_id || response.data.uuid;
        if (!searchId) throw new Error('No search_id returned from init');
    } catch (error) {
        console.error('--- Travelpayouts v1 API Error (Init) ---');
        console.error('Status:', error.response?.status);
        console.error('Response Data:', error.response?.data);
        console.error('Error Message:', error.message);
        console.error('Full Axios Error Object:', error.toJSON?.() || error);
        console.error('---------------------------------');
        throw new Error('Failed to initialize flight search with Travelpayouts v1');
    }

    // No delay before first poll - faster search

    // Step 2: Poll for results
    let pollCount = 0;
    let results;
    
    while (pollCount < 10) {
        const pollStart = Date.now();
        try {
            const res = await axios.get(
                `${RESULTS_URL}?uuid=${searchId}`
                // No headers for GET request!
            );
            const pollDuration = (Date.now() - pollStart) / 1000;
            results = res.data;
            if (Array.isArray(results) && results.length > 0) {
                break;
            }
            if (results && typeof results === 'object' && Object.keys(results).length === 1 && (results.search_id || results.uuid)) {
                // Just search_id, stop polling as per support instructions
                break;
            } else if (results && results.error) {
                throw new Error(results.error);
            }
            // Wait 1s before next poll for faster results, unless this is the last poll
            if (pollCount < 9) {
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (err) {
            console.error('--- Travelpayouts v1 API Error (Polling) ---');
            console.error('Error:', err.message);
            throw new Error('Failed to poll flight search results from Travelpayouts v1');
        }
        pollCount++;
    }
    if (!Array.isArray(results)) {
        throw new Error('No flight results returned from Travelpayouts v1');
    }
    console.log('--- RAW Travelpayouts API Response (before transform) ---');
    console.dir(results, { depth: 5 });
    console.log('--------------------------------------------------------');
    return results;
};

// New streaming search function for progressive loading
const searchFlightsStreaming = async (origin, destination, departure_date, return_date, adults, onProgress) => {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    const marker = process.env.TRAVELPAYOUTS_MARKER;
    const host = process.env.TRAVELPAYOUTS_HOST || 'localhost';

    // Fetch public IP for user_ip
    const user_ip = await getPublicIP();

    // Build request body as per docs, with signature as the first property
    const params = {
        signature: '', // placeholder, will set after generation
        host,
        marker,
        user_ip,
        locale: 'en',
        trip_class: 'Y',
        passengers: {
            adults: adults || 1,
            children: 0,
            infants: 0
        },
        segments: [
            { origin, destination, date: departure_date }
        ]
    };
    if (return_date) {
        params.segments.push({ origin: destination, destination: origin, date: return_date });
    }
    // Generate signature for the params (excluding the placeholder)
    params.signature = generateSignature(params, token);

    const headers = {
        'Content-Type': 'application/json'
    };

    // Step 1: POST to initialize search
    let searchId;
    try {
        const response = await axios.post(API_URL, params, { headers });
        searchId = response.data.search_id || response.data.uuid;
        if (!searchId) throw new Error('No search_id returned from init');
    } catch (error) {
        console.error('--- Travelpayouts v1 API Error (Init) ---');
        console.error('Status:', error.response?.status);
        console.error('Response Data:', error.response?.data);
        console.error('Error Message:', error.message);
        throw new Error('Failed to initialize flight search with Travelpayouts v1');
    }

    // Step 2: Poll for results with progressive updates
    // Wait 3 seconds before starting to poll
    await new Promise(r => setTimeout(r, 3000));
    
    let pollCount = 0;
    let allResults = [];
    let lastResultCount = 0;
    
    while (pollCount < 10) {
        const pollStart = Date.now();
        try {
            const res = await axios.get(`${RESULTS_URL}?uuid=${searchId}`);
            const pollDuration = (Date.now() - pollStart) / 1000;
            const results = res.data;
            
            // Log raw API response (only on first successful poll to avoid spam)
            if (pollCount === 0 && Array.isArray(results) && results.length > 0) {
                console.log('--- RAW Travelpayouts API Response (Streaming) ---');
                console.dir(results, { depth: 5 });
                console.log('--------------------------------------------------------');
            }
            
            if (Array.isArray(results) && results.length > 0) {
                // Check if we have new results
                const currentResultCount = results.reduce((total, item) => {
                    return total + (Array.isArray(item.proposals) ? item.proposals.length : 0);
                }, 0);
                
                if (currentResultCount > lastResultCount) {
                    // Transform and send ALL results (not just new ones)
                    const allFlights = return_date 
                        ? await transformTravelpayoutsRoundTripResponse(results)
                        : await transformTravelpayoutsFlightResponse(results);
                    
                    // Call progress callback with ALL flights
                    if (onProgress && typeof onProgress === 'function') {
                        onProgress({
                            type: 'progress',
                            flights: allFlights,
                            totalFound: currentResultCount,
                            isComplete: false
                        });
                    }
                    
                    lastResultCount = currentResultCount;
                    allResults = results;
                }
                
                // If we have substantial results, we can stop early
                if (currentResultCount >= 30) {
                    break;
                }
            }
            
            if (results && results.error) {
                throw new Error(results.error);
            }
            
            // Wait 1s before next poll
            if (pollCount < 9) {
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (err) {
            console.error('--- Travelpayouts v1 API Error (Streaming Polling) ---');
            console.error('Error:', err.message);
            throw new Error('Failed to poll flight search results from Travelpayouts v1');
        }
        pollCount++;
    }
    
    // Send final complete results
    if (onProgress && typeof onProgress === 'function') {
        const finalFlights = return_date 
            ? await transformTravelpayoutsRoundTripResponse(allResults)
            : await transformTravelpayoutsFlightResponse(allResults);
        
        onProgress({
            type: 'complete',
            flights: finalFlights,
            totalFound: lastResultCount,
            isComplete: true
        });
    }
    
    if (!Array.isArray(allResults)) {
        throw new Error('No flight results returned from Travelpayouts v1');
    }
    
    return allResults;
};

// --- Live exchange rate conversion to INR ---
const exchangeRateCache = { rates: {}, timestamp: 0 };
const fetchExchangeRatesToINR = async () => {
  const now = Date.now();
  if (exchangeRateCache.timestamp && now - exchangeRateCache.timestamp < 60 * 60 * 1000) {
    return exchangeRateCache.rates;
  }
  try {
    const res = await axios.get('https://api.exchangerate-api.com/v4/latest/INR');
    const rates = res.data.rates;
    exchangeRateCache.rates = rates;
    exchangeRateCache.timestamp = now;
    return rates;
  } catch (err) {
    console.error('Failed to fetch exchange rates:', err.message);
    return exchangeRateCache.rates || undefined;
  }
};

const convertToINR = (amount, fromCurrency, rates) => {
  if (!amount || !fromCurrency) return amount;

  const code = fromCurrency.toUpperCase();
  if (code === 'INR') return amount;

  // Use only real-time rates
  let rate = rates && rates[code];

  if (!rate || rate === 0) {
    return amount;
  }

  // Convert: amount / rate (since rates are in 1 INR = X currency)
  const converted = Math.round(amount / rate);
  return converted;
};

const transformTravelpayoutsFlightResponse = async (apiResponse) => {
    const flights = [];
    const rates = await fetchExchangeRatesToINR();

    // The root is an array of objects, each with a proposals array
    for (const item of (Array.isArray(apiResponse) ? apiResponse : [])) {
        if (Array.isArray(item.proposals)) {
            for (const proposal of item.proposals) {
                // Price and currency
                let price = 0, currency = 'USD', bookingLink = '';
                let firstTermKey = null;
                if (proposal.terms && typeof proposal.terms === 'object') {
                    firstTermKey = Object.keys(proposal.terms)[0];
                    if (firstTermKey && proposal.terms[firstTermKey].price) {
                        price = proposal.terms[firstTermKey].price;
                        currency = proposal.terms[firstTermKey].currency || currency;
                        bookingLink = proposal.terms[firstTermKey].url
                            ? `https://www.travelpayouts.com/redirect/${proposal.terms[firstTermKey].url}`
                            : '';
                    }
                }
                const priceINR = convertToINR(price, currency, rates);

                // Airline
                const airline = Array.isArray(proposal.carriers) && proposal.carriers.length > 0
                    ? proposal.carriers[0]
                    : (proposal.validating_carrier || 'Unknown');

                // Segment/flight info
                let origin = '', destination = '', departureTime = '', arrivalTime = '', flightNumber = 'N/A';
                if (Array.isArray(proposal.segment) && proposal.segment.length > 0) {
                    const seg = proposal.segment[0];
                    if (Array.isArray(seg.flight) && seg.flight.length > 0) {
                        const flight = seg.flight[0];
                        origin = flight.departure || '';
                        destination = flight.arrival || '';
                        departureTime = `${flight.departure_date || ''} ${flight.departure_time || ''}`;
                        arrivalTime = `${flight.arrival_date || ''} ${flight.arrival_time || ''}`;
                        flightNumber = flight.number || 'N/A';
                    }
                }

                // Store booking data for dynamic link generation
                const bookingData = firstTermKey ? {
                    searchId: apiResponse[0]?.search_id || apiResponse[0]?.uuid,
                    termsUrl: proposal.terms[firstTermKey]?.url || firstTermKey
                } : null;

                flights.push({
                    airline,
                    price: priceINR,
                    currency: 'INR',
                    origin,
                    destination,
                    departureTime,
                    arrivalTime,
                    flightNumber,
                    bookingData // Store booking data instead of direct link
                });
            }
        }
    }
    return flights;
};

// Round Trip Transformation Function - SEPARATE from one-way function
const transformTravelpayoutsRoundTripResponse = async (apiResponse) => {
    const flights = [];
    const rates = await fetchExchangeRatesToINR();

    // The root is an array of objects, each with a proposals array
    for (const item of (Array.isArray(apiResponse) ? apiResponse : [])) {
        if (Array.isArray(item.proposals)) {
            for (const proposal of item.proposals) {
                // Check if this is a round trip (2 segments)
                if (Array.isArray(proposal.segment) && proposal.segment.length === 2) {
                    // Price and currency
                    let price = 0, currency = 'USD', bookingLink = '';
                    let firstTermKey = null;
                    if (proposal.terms && typeof proposal.terms === 'object') {
                        firstTermKey = Object.keys(proposal.terms)[0];
                        if (firstTermKey && proposal.terms[firstTermKey].price) {
                            price = proposal.terms[firstTermKey].price;
                            currency = proposal.terms[firstTermKey].currency || currency;
                            bookingLink = proposal.terms[firstTermKey].url
                                ? `https://www.travelpayouts.com/redirect/${proposal.terms[firstTermKey].url}`
                                : '';
                        }
                    }
                    const priceINR = convertToINR(price, currency, rates);

                    // Airline
                    const airline = Array.isArray(proposal.carriers) && proposal.carriers.length > 0
                        ? proposal.carriers[0]
                        : (proposal.validating_carrier || 'Unknown');

                    // Extract onward flight details (first segment - complete journey)
                    let onwardOrigin = '', onwardDestination = '', onwardDepartureTime = '', onwardArrivalTime = '', onwardFlightNumber = 'N/A';
                    if (proposal.segment[0] && Array.isArray(proposal.segment[0].flight) && proposal.segment[0].flight.length > 0) {
                        // For onward: first flight departure to last flight arrival
                        const firstFlight = proposal.segment[0].flight[0];
                        const lastFlight = proposal.segment[0].flight[proposal.segment[0].flight.length - 1];
                        onwardOrigin = firstFlight.departure || '';
                        onwardDestination = lastFlight.arrival || '';
                        onwardDepartureTime = `${firstFlight.departure_date || ''} ${firstFlight.departure_time || ''}`;
                        onwardArrivalTime = `${lastFlight.arrival_date || ''} ${lastFlight.arrival_time || ''}`;
                        // Show first flight number for onward
                        onwardFlightNumber = firstFlight.number || 'N/A';
                    }

                    // Extract return flight details (second segment - complete journey)
                    let returnOrigin = '', returnDestination = '', returnDepartureTime = '', returnArrivalTime = '', returnFlightNumber = 'N/A';
                    if (proposal.segment[1] && Array.isArray(proposal.segment[1].flight) && proposal.segment[1].flight.length > 0) {
                        // For return: first flight departure to last flight arrival
                        const firstFlight = proposal.segment[1].flight[0];
                        const lastFlight = proposal.segment[1].flight[proposal.segment[1].flight.length - 1];
                        returnOrigin = firstFlight.departure || '';
                        returnDestination = lastFlight.arrival || '';
                        returnDepartureTime = `${firstFlight.departure_date || ''} ${firstFlight.departure_time || ''}`;
                        returnArrivalTime = `${lastFlight.arrival_date || ''} ${lastFlight.arrival_time || ''}`;
                        // Show first flight number for return
                        returnFlightNumber = firstFlight.number || 'N/A';
                    }

                    flights.push({
                        airline,
                        price: priceINR,
                        currency: 'INR',
                        origin: onwardOrigin,
                        destination: onwardDestination,
                        departureTime: onwardDepartureTime,
                        arrivalTime: onwardArrivalTime,
                        flightNumber: onwardFlightNumber,
                        // Round trip specific properties
                        isRoundTrip: true,
                        onward: {
                            origin: onwardOrigin,
                            destination: onwardDestination,
                            departureTime: onwardDepartureTime,
                            arrivalTime: onwardArrivalTime,
                            flightNumber: onwardFlightNumber
                        },
                        return: {
                            origin: returnOrigin,
                            destination: returnDestination,
                            departureTime: returnDepartureTime,
                            arrivalTime: returnArrivalTime,
                            flightNumber: returnFlightNumber
                        },
                        bookingData: firstTermKey ? {
                            searchId: apiResponse[0]?.search_id || apiResponse[0]?.uuid,
                            termsUrl: proposal.terms[firstTermKey]?.url || firstTermKey
                        } : null
                    });
                }
            }
        }
    }
    return flights;
};


  
      module.exports = {
        searchFlightsRealtime,
        searchFlightsStreaming,                      // New streaming function
        transformTravelpayoutsFlightResponse,        // One-way (untouched)
        transformTravelpayoutsRoundTripResponse,      // Round trip (new)
        fetchExchangeRatesToINR,
        convertToINR
    };