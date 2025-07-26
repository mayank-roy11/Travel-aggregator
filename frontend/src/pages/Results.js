import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResultList from '../components/ResultList';
import './Results.css';

const Results = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const type = searchParams.get('type') || 'flights';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const city = searchParams.get('city');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const returnDate = searchParams.get('return_date');

  useEffect(() => {
    const fetchResults = async () => {
      if (inFlight.current) return; // Prevent duplicate fetches
      inFlight.current = true;
      setLoading(true);
      setError(null);

      try {
        let url = '';
        let params = new URLSearchParams();

        if (type === 'flights') {
          url = 'http://localhost:5000/api/flights/search';
          params.append('from', from);
          params.append('to', to);
          params.append('date', date);
          if (returnDate) {
            params.append('return_date', returnDate);
          }
          if (searchParams.get('adults')) {
            params.append('adults', searchParams.get('adults'));
          }
        } else {
          url = 'http://localhost:5000/api/hotels/search';
          params.append('city', city);
          params.append('checkIn', checkIn);
          params.append('checkOut', checkOut);
          if (searchParams.get('guests')) {
            params.append('guests', searchParams.get('guests'));
          }
          if (searchParams.get('rooms')) {
            params.append('rooms', searchParams.get('rooms'));
          }
        }

        const response = await fetch(`${url}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        
        if (data.success) {
          setResults(data.data); // Always set to data, even if []
          // Only set error if there are API errors AND no results at all
          if (data.errors && data.errors.length > 0 && (!data.data || data.data.length === 0)) {
            const errorMessages = data.errors.map(err => `${err.provider}: ${err.error}`).join(', ');
            setError(`Some providers failed: ${errorMessages}.`);
            // Do not setResults(null) here, keep as []
          }
        } else {
          setError(data.error || 'Failed to fetch results');
          setResults(null);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err.message);
        setResults(null);
      } finally {
        setLoading(false);
        inFlight.current = false;
      }
    };

    fetchResults();
  }, [type, from, to, date, city, checkIn, checkOut, searchParams]);

  const getSearchSummary = () => {
    if (type === 'flights') {
      return `${from} to ${to} on ${new Date(date).toLocaleDateString()}`;
    } else {
      return `${city} from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}`;
    }
  };

  // Only show error screen if results is null (not just empty)
  if (error && results === null) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="container">
        <div className="search-summary">
          <h1>Search Results</h1>
          <p>{getSearchSummary()}</p>
        </div>
        <ResultList results={results} type={type} loading={loading} from={from} to={to} />
      </div>
    </div>
  );
};

export default Results; 