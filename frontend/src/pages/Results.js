import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResultList from '../components/ResultList';
import './Results.css';

const Results = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState({ totalFound: 0, isComplete: false });
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
      setResults([]);
      setIsStreaming(false);
      setStreamingProgress({ totalFound: 0, isComplete: false });

      try {
        if (type === 'flights') {
          // Try streaming first, fallback to regular search
          await fetchResultsStreaming();
        } else {
          // Hotels use regular search
          await fetchResultsRegular();
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

    const fetchResultsStreaming = async () => {
      let url = 'http://localhost:5000/api/flights/search/stream';
      let params = new URLSearchParams();
      params.append('from', from);
      params.append('to', to);
      params.append('date', date);
      if (returnDate) {
        params.append('return_date', returnDate);
      }
      if (searchParams.get('adults')) {
        params.append('adults', searchParams.get('adults'));
      }

      try {
        const eventSource = new EventSource(`${url}?${params.toString()}`);
        setIsStreaming(true);

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('Streaming search started');
              break;
              
            case 'progress':
              // Update results with new flights
              setResults(prevResults => {
                // Merge new flights, avoiding duplicates
                const existingIds = new Set(prevResults.map(f => `${f.airline}-${f.flightNumber}-${f.departureTime}`));
                const newFlights = data.flights.filter(f => {
                  const id = `${f.airline}-${f.flightNumber}-${f.departureTime}`;
                  return !existingIds.has(id);
                });
                return [...prevResults, ...newFlights];
              });
              setStreamingProgress({
                totalFound: data.totalFound,
                isComplete: false
              });
              break;
              
            case 'complete':
              // Final update
              setResults(data.flights);
              setStreamingProgress({
                totalFound: data.totalFound,
                isComplete: true
              });
              setIsStreaming(false);
              eventSource.close();
              break;
              
            case 'error':
              setError(data.error);
              setIsStreaming(false);
              eventSource.close();
              break;
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          eventSource.close();
          // Fallback to regular search
          fetchResultsRegular().catch(err => {
            console.error('Fallback search failed:', err);
            setError('Search failed. Please try again.');
          });
        };

      } catch (error) {
        console.error('Streaming failed, falling back to regular search:', error);
        // Fallback to regular search
        fetchResultsRegular().catch(err => {
          console.error('Fallback search failed:', err);
          setError('Search failed. Please try again.');
        });
      }
    };

    const fetchResultsRegular = async () => {
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
        setResults(data.data);
        if (data.errors && data.errors.length > 0 && (!data.data || data.data.length === 0)) {
          const errorMessages = data.errors.map(err => `${err.provider}: ${err.error}`).join(', ');
          setError(`Some providers failed: ${errorMessages}.`);
        }
      } else {
        setError(data.error || 'Failed to fetch results');
        setResults(null);
      }
    };

    fetchResults();
  }, [searchParams, type, from, to, date, city, checkIn, checkOut, returnDate]);

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
        <div className="results-header">
          <h1>Search Results</h1>
          <p>{getSearchSummary()}</p>
          {isStreaming && (
            <div className="streaming-indicator">
              <div className="spinner"></div>
              <span>Finding more flights... ({streamingProgress.totalFound} found)</span>
            </div>
          )}
        </div>
        
        <ResultList 
          results={results} 
          type={type} 
          loading={loading && !isStreaming} 
          from={from} 
          to={to}
          isStreaming={isStreaming}
          streamingProgress={streamingProgress}
        />
      </div>
    </div>
  );
};

export default Results; 