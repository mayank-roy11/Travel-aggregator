import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Default flight search
export const searchFlights = async (searchParams) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flights/search`, searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
};



export const getFlightDetails = async (proposalIndex, itemIndex, searchParams) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flights/details`, {
      proposalIndex,
      itemIndex,
      searchParams
    });
    return response.data;
  } catch (error) {
    console.error('Error getting flight details:', error);
    throw error;
  }
};

export const generateBookingLink = async (bookingData) => {
  try {
    const params = new URLSearchParams();
    params.append('searchId', bookingData.searchId);
    params.append('termsUrl', bookingData.termsUrl);
    const response = await axios.get(`${API_BASE_URL}/flights/booking-link?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error generating booking link:', error);
    throw error;
  }
}; 