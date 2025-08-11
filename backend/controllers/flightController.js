const { searchFlightsRealtime, searchFlightsStreaming, transformTravelpayoutsFlightResponse, transformTravelpayoutsRoundTripResponse } = require('../services/travelpayoutsService');
const { extractEnhancedFlightDetails } = require('../services/flightDetailsEnhancer');
const axios = require('axios');

exports.searchFlights = async (req, res) => {
            try {
            // Support both GET (req.query) and POST (req.body)
            const from = req.body.from || req.query.from;
            const to = req.body.to || req.query.to;
            const date = req.body.date || req.query.date;
            const return_date = req.body.return_date || req.query.return_date;
            const adults = req.body.adults || req.query.adults || 1;

        if (!from || !to || !date) {
            return res.status(400).json({ error: 'Missing required parameters: from, to, or date' });
        }

        const allFlights = [];

        const travelpayoutsData = await searchFlightsRealtime(from, to, date, return_date, adults);
        
        // Use appropriate transformation function based on trip type
        let formattedFlights;
        if (return_date) {
            // Round trip - use round trip transformation
            formattedFlights = await transformTravelpayoutsRoundTripResponse(travelpayoutsData);
        } else {
            // One-way - use existing transformation (untouched)
            formattedFlights = await transformTravelpayoutsFlightResponse(travelpayoutsData);
        }
        
        allFlights.push(...formattedFlights);

        res.status(200).json({
            success: true,
            count: allFlights.length,
            data: allFlights,
            providersSearched: ['travelpayouts_v1'],
            errors: []
        });
        
    } catch (error) {
        console.error('Search error:', error.message);
        if (error.message === 'No flight results returned from Travelpayouts v1') {
            // Not a real error, just no results
            res.status(200).json({
                success: true,
                count: 0,
                data: [],
                providersSearched: ['travelpayouts_v1'],
                errors: []
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message,
                providersSearched: ['travelpayouts_v1']
            });
        }
    }
};

// New endpoint for enhanced flight details
exports.getFlightDetails = async (req, res) => {
  try {
    const { proposalIndex, itemIndex, searchParams } = req.body;
    
    if (proposalIndex === undefined || itemIndex === undefined || !searchParams) {
      return res.status(400).json({ 
        error: 'Missing required parameters: proposalIndex, itemIndex, searchParams' 
      });
    }

    const { origin, destination, departure_date, return_date, adults } = searchParams;
    
    // Set defaults for missing parameters
    const searchParamsWithDefaults = {
      origin: origin || 'DEL',
      destination: destination || 'BOM', 
      departure_date: departure_date || new Date().toISOString().split('T')[0],
      return_date: return_date || null,
      adults: adults || 1
    };
    
    // Perform the same search to get the raw API response
    const rawApiResponse = await searchFlightsRealtime(
      searchParamsWithDefaults.origin, 
      searchParamsWithDefaults.destination, 
      searchParamsWithDefaults.departure_date, 
      searchParamsWithDefaults.return_date, 
      searchParamsWithDefaults.adults
    );

    if (!rawApiResponse || !Array.isArray(rawApiResponse)) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Extract enhanced details for the specific flight
    const enhancedDetails = extractEnhancedFlightDetails(
      rawApiResponse, 
      parseInt(proposalIndex), 
      parseInt(itemIndex)
    );

    if (!enhancedDetails) {
      return res.status(404).json({ error: 'Enhanced flight details not found' });
    }

    res.json({
      success: true,
      enhancedDetails
    });

  } catch (error) {
    console.error('Error fetching enhanced flight details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch enhanced flight details',
      details: error.message 
    });
      }
};

// Generate booking link endpoint
exports.generateBookingLink = async (req, res) => {
    try {
        const { searchId, termsUrl, gateId } = req.query;
        
        if (!searchId || !termsUrl) {
            return res.status(400).json({ 
                error: 'Missing required parameters: searchId and termsUrl' 
            });
        }

        const token = process.env.TRAVELPAYOUTS_TOKEN;
        const marker = process.env.TRAVELPAYOUTS_MARKER;
        
        if (!token || !marker) {
            return res.status(500).json({ 
                error: 'Travelpayouts credentials not configured' 
            });
        }

        // Make request to get booking link
        const bookingUrl = `https://api.travelpayouts.com/v1/flight_searches/${searchId}/clicks/${termsUrl}.json?marker=${marker}`;
        
        const response = await axios.get(bookingUrl);
        
        if (!response.data || !response.data.url) {
            return res.status(404).json({ 
                error: 'Booking link not available' 
            });
        }

        // Normalize currency to INR in returned URL/params so clients redirect with INR
        const data = response.data;
        let finalUrl = data.url;
        let finalParams = data.params;

        try {
            const u = new URL(finalUrl);
            const q = u.searchParams;
            const currencyQueryKeys = ['currency', 'cur', 'user_currency', 'userCurrency'];
            let changed = false;
            for (const k of currencyQueryKeys) {
                if (q.has(k)) {
                    q.set(k, 'INR');
                    changed = true;
                }
            }
            if (!changed) {
                q.append('currency', 'INR');
            }

            // IndiGo specific handling: ensure INR context via country/locale
            const host = u.hostname.toLowerCase();
            const isIndiGo = /(^|\.)goindigo\.[a-z]+$|(^|\.)indigo\.[a-z]+$/i.test(host) || /goindigo|indigo/.test(host);
            if (isIndiGo) {
                if (!q.has('country')) q.append('country', 'IN');
                if (!q.has('pos')) q.append('pos', 'IN');
                if (!q.has('market')) q.append('market', 'IN');
                if (!q.has('localeCountry')) q.append('localeCountry', 'IN');
                if (q.has('locale')) {
                    q.set('locale', 'en-IN');
                } else if (q.has('lang')) {
                    q.set('lang', 'en-IN');
                } else {
                    q.append('locale', 'en-IN');
                }

                const extraCurrencyKeys = [
                  'selectedCurrency',
                  'preferredCurrency',
                  'prefCurrency',
                  'currencyCode',
                  'curr',
                  'pc'
                ];
                for (const key of extraCurrencyKeys) {
                  if (q.has(key)) q.set(key, 'INR'); else q.append(key, 'INR');
                }
            }
            finalUrl = u.toString();
        } catch (e) {
            // keep original URL on parse failure
        }

        if (data.method === 'POST') {
            finalParams = { ...(data.params || {}) };
            ['UserCurrency', 'DisplayedPriceCurrency', 'currency', 'user_currency', 'cur'].forEach((k) => {
                finalParams[k] = 'INR';
            });

            // IndiGo specific handling for POST-based redirects
            try {
                const u = new URL(finalUrl);
                const host = u.hostname.toLowerCase();
                const isIndiGo = /(^|\.)goindigo\.[a-z]+$|(^|\.)indigo\.[a-z]+$/i.test(host) || /goindigo|indigo/.test(host);
                if (isIndiGo) {
                    if (!finalParams.country) finalParams.country = 'IN';
                    if (!finalParams.pos) finalParams.pos = 'IN';
                    if (!finalParams.market) finalParams.market = 'IN';
                    if (!finalParams.localeCountry) finalParams.localeCountry = 'IN';
                    if (finalParams.locale) {
                        finalParams.locale = 'en-IN';
                    } else if (finalParams.lang) {
                        finalParams.lang = 'en-IN';
                    } else {
                        finalParams.locale = 'en-IN';
                    }

                    const extraCurrencyKeys = [
                      'selectedCurrency',
                      'preferredCurrency',
                      'prefCurrency',
                      'currencyCode',
                      'curr',
                      'pc'
                    ];
                    extraCurrencyKeys.forEach((k) => {
                      finalParams[k] = 'INR';
                    });
                }
            } catch (_) {
                // ignore
            }
        }

        res.json({
            success: true,
            bookingData: {
                ...data,
                url: finalUrl,
                params: finalParams
            }
        });

        

    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to generate booking link',
            details: error.message 
        });

                       console.error('Error generating booking link:', error.message);
    }
};

// New endpoint for flights with multiple pricing options
exports.searchFlightsWithMultiplePrices = async (req, res) => {
    console.log('Flight search with multiple prices controller called at', new Date().toISOString());
    try {
        // Support both GET (req.query) and POST (req.body)
        const from = req.body.from || req.query.from;
        const to = req.body.to || req.query.to;
        const date = req.body.date || req.query.date;
        const return_date = req.body.return_date || req.query.return_date;
        const adults = req.body.adults || req.query.adults || 1;

        if (!from || !to || !date) {
            return res.status(400).json({ error: 'Missing required parameters: from, to, or date' });
        }

        const allFlights = [];

        const travelpayoutsData = await searchFlightsRealtime(from, to, date, return_date, adults);
        
        // Use enhanced transformation for multiple pricing options
        let formattedFlights;
        if (return_date) {
            // Round trip - use enhanced transformation with multiple pricing options
            formattedFlights = await transformRoundTripWithMultiplePrices(travelpayoutsData);
        } else {
            // One-way - use enhanced transformation with multiple pricing options
            formattedFlights = await transformOneWayWithMultiplePrices(travelpayoutsData);
        }
        
        allFlights.push(...formattedFlights);

        res.status(200).json({
            success: true,
            count: allFlights.length,
            data: allFlights,
            providersSearched: ['travelpayouts_v1'],
            errors: [],
            hasMultiplePricing: true
        });
    } catch (error) {
        console.error('Search error:', error.message);
        if (error.message === 'No flight results returned from Travelpayouts v1') {
            // Not a real error, just no results
            res.status(200).json({
                success: true,
                count: 0,
                data: [],
                providersSearched: ['travelpayouts_v1'],
                errors: [],
                hasMultiplePricing: true
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message,
                providersSearched: ['travelpayouts_v1']
            });
        }
    }
};

// New streaming search endpoint for progressive loading
exports.searchFlightsStreaming = async (req, res) => {
    try {
        // Support both GET (req.query) and POST (req.body)
        const from = req.body.from || req.query.from;
        const to = req.body.to || req.query.to;
        const date = req.body.date || req.query.date;
        const return_date = req.body.return_date || req.query.return_date;
        const adults = req.body.adults || req.query.adults || 1;

        if (!from || !to || !date) {
            return res.status(400).json({ error: 'Missing required parameters: from, to, or date' });
        }

        // Set up Server-Sent Events headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Send initial connection message
        res.write(`data: ${JSON.stringify({
            type: 'connected',
            message: 'Search started'
        })}\n\n`);

        // Progress callback function
        const onProgress = (progressData) => {
            const eventData = {
                type: progressData.type,
                flights: progressData.flights,
                totalFound: progressData.totalFound,
                isComplete: progressData.isComplete,
                timestamp: new Date().toISOString()
            };
            
            res.write(`data: ${JSON.stringify(eventData)}\n\n`);
            
            // If search is complete, end the stream
            if (progressData.isComplete) {
                res.end();
            }
        };

        // Start streaming search
        await searchFlightsStreaming(from, to, date, return_date, adults, onProgress);

    } catch (error) {
        console.error('Streaming search error:', error.message);
        
        // Send error event
        const errorEvent = {
            type: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
        res.end();
    }
};


