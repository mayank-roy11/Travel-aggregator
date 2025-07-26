/**
 * Enhanced Flight Details Extractor
 * Extracts additional flight information from Travelpayouts API response
 * without modifying the existing transformation logic
 */

const extractEnhancedFlightDetails = (apiResponse, proposalIndex = 0, itemIndex = 0) => {
  try {
    // Navigate to the specific proposal
    const item = Array.isArray(apiResponse) ? apiResponse[itemIndex] : null;
    if (!item || !Array.isArray(item.proposals) || !item.proposals[proposalIndex]) {
      return null;
    }

    const proposal = item.proposals[proposalIndex];
    const enhancedDetails = {
      // Basic info (already available in main transformation)
      airline: Array.isArray(proposal.carriers) && proposal.carriers.length > 0 
        ? proposal.carriers[0] 
        : (proposal.validating_carrier || 'Unknown'),
      validatingCarrier: proposal.validating_carrier,
      
      // Pricing details
      pricing: extractPricingDetails(proposal.terms),
      
      // Flight segments and details
      segments: extractSegmentDetails(proposal.segment),
      
      // Baggage information
      baggage: extractBaggageInfo(proposal.terms),
      
      // Additional metadata
      metadata: {
        totalSegments: Array.isArray(proposal.segment) ? proposal.segment.length : 0,
        isRoundTrip: Array.isArray(proposal.segment) && proposal.segment.length === 2,
        hasMultipleFlights: hasMultipleFlights(proposal.segment)
      }
    };

    return enhancedDetails;
  } catch (error) {
    console.error('Error extracting enhanced flight details:', error);
    return null;
  }
};

const extractPricingDetails = (terms) => {
  if (!terms || typeof terms !== 'object') return null;
  
  const firstTermKey = Object.keys(terms)[0];
  if (!firstTermKey) return null;
  
  const term = terms[firstTermKey];
  return {
    price: term.price,
    currency: term.currency,
    unifiedPrice: term.unified_price,
    multiplier: term.multiplier,
    proposalMultiplier: term.proposal_multiplier,
    bookingUrl: term.url ? `https://www.travelpayouts.com/redirect/${term.url}` : null
  };
};

const extractSegmentDetails = (segments) => {
  if (!Array.isArray(segments)) return [];
  
  return segments.map((segment, segmentIndex) => {
    const segmentDetails = {
      segmentIndex,
      flights: []
    };
    
    if (Array.isArray(segment.flight)) {
      segmentDetails.flights = segment.flight.map((flight, flightIndex) => ({
        flightIndex,
        flightNumber: flight.number || 'N/A',
        departure: {
          airport: flight.departure,
          time: flight.departure_time,
          date: flight.departure_date,
          terminal: flight.departure_terminal || null
        },
        arrival: {
          airport: flight.arrival,
          time: flight.arrival_time,
          date: flight.arrival_date,
          terminal: flight.arrival_terminal || null
        },
        aircraft: {
          type: flight.aircraft || null,
          registration: flight.registration || null
        },
        operatingCarrier: flight.operating_carrier || null,
        fareBasis: flight.fare_basis || null,
        bookingClass: flight.booking_class || null,
        duration: flight.duration || null,
        stops: flight.stops || 0,
        layoverDuration: flight.layover_duration || null,
        meal: flight.meal || null,
        seatsRemaining: flight.seats_remaining || null,
        wifi: flight.wifi || false,
        entertainment: flight.entertainment || null,
        powerOutlets: flight.power_outlets || false
      }));
    }
    
    return segmentDetails;
  });
};

const extractBaggageInfo = (terms) => {
  if (!terms || typeof terms !== 'object') return null;
  
  const firstTermKey = Object.keys(terms)[0];
  if (!firstTermKey) return null;
  
  const term = terms[firstTermKey];
  
  // Extract baggage info from flights_handbags if available
  let baggageInfo = null;
  if (term.flights_handbags && Array.isArray(term.flights_handbags)) {
    baggageInfo = {
      cabin: term.flights_handbags.map(segment => segment[0] || 'N/A'),
      checked: term.flights_handbags.map(segment => segment[1] || 'N/A')
    };
  }
  
  return {
    cabinBaggage: baggageInfo?.cabin || ['7 kg per adult'],
    checkedBaggage: baggageInfo?.checked || ['15 kg per adult'],
    additionalInfo: term.baggage_info || null
  };
};

const hasMultipleFlights = (segments) => {
  if (!Array.isArray(segments)) return false;
  
  return segments.some(segment => 
    Array.isArray(segment.flight) && segment.flight.length > 1
  );
};

// Helper function to get flight duration
const calculateFlightDuration = (departureTime, arrivalTime, departureDate, arrivalDate) => {
  try {
    const dep = new Date(`${departureDate} ${departureTime}`);
    const arr = new Date(`${arrivalDate} ${arrivalTime}`);
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

// Helper function to format duration
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

module.exports = {
  extractEnhancedFlightDetails,
  calculateFlightDuration,
  formatDuration
}; 