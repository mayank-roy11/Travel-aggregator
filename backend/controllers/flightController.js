const { searchFlightsRealtime, transformTravelpayoutsFlightResponse, transformTravelpayoutsRoundTripResponse } = require('../services/travelpayoutsService');
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
            console.log('=== ROUND TRIP DEBUG ===');
            console.log('API Response length:', travelpayoutsData.length);
            console.log('First item proposals:', travelpayoutsData[0]?.proposals?.length);
            console.log('Sample proposal segments:', travelpayoutsData[0]?.proposals?.[0]?.segment?.length);
            formattedFlights = await transformTravelpayoutsRoundTripResponse(travelpayoutsData);
            console.log('Round trip flights found:', formattedFlights.length);
            console.log('========================');
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
        
        // Debug logs at the end so they're visible
        console.log('=== FLIGHT SEARCH DEBUG ===');
        console.log('Flight search controller called at', new Date().toISOString());
        console.log('Request body:', req.body);
        console.log('Request query:', req.query);
        console.log('Extracted params:', { from, to, date, return_date, adults });
        console.log('Is Round Trip:', !!return_date);
        console.log('Total flights found:', allFlights.length);
        console.log('================================');
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

        res.json({
            success: true,
            bookingData: response.data
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


