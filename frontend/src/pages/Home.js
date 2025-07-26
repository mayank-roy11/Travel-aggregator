import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (searchData) => {
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    searchParams.append('from', searchData.from);
    searchParams.append('to', searchData.to);
    searchParams.append('date', searchData.date);
    searchParams.append('adults', searchData.adults);
    
    if (searchData.tripType === 'round-trip' && searchData.return_date) {
      searchParams.append('return_date', searchData.return_date);
    }
    
    // Navigate to results page with search parameters
    navigate(`/results?${searchParams.toString()}`);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <SearchForm onSearch={handleSearch} />
        </div>
      </div>
    </div>
  );
};

export default Home; 