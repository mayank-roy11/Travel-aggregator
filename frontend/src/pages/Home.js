import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResponsiveSearchForm from '../components/ResponsiveSearchForm';
import './Home.css';
import { API_BASE_URL } from '../config/apiConfig';

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

  // Keep only 3 cards (removed Paris)
  const [popularDestinations, setPopularDestinations] = useState([
    {
      id: 2,
      name: 'Tokyo, Japan',
      description: 'Modern culture meets tradition',
      price: 'from —',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      iata: 'TYO'
    },
    {
      id: 3,
      name: 'New York, USA',
      description: 'The city that never sleeps',
      price: 'from —',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      iata: 'NYC'
    },
    {
      id: 4,
      name: 'London, UK',
      description: 'Rich history and modern charm',
      price: 'from —',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
      iata: 'LON'
    }
  ]);

  // Simple modal state for unavailable deals
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [dealModalMessage, setDealModalMessage] = useState('');

  // Helper to format INR
  const formatINR = (n) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    } catch {
      return `₹${Number(n).toLocaleString('en-IN')}`;
    }
  };

  // Fetch cheapest INR price for each destination for today's date
  useEffect(() => {
    const fetchCheapest = async () => {
      const origin = 'BLR';
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const date = `${yyyy}-${mm}-${dd}`;

      const updated = await Promise.all(popularDestinations.map(async (dest) => {
        try {
          const url = `${API_BASE_URL}/flights/search?from=${origin}&to=${dest.iata}&date=${date}&adults=1`;
          const res = await fetch(url);
          const json = await res.json();
          if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
            // Find minimum price (already returned in INR by backend transforms)
            const minPrice = json.data.reduce((min, f) => Math.min(min, Number(f.price || Infinity)), Infinity);
            if (minPrice !== Infinity) {
              return { ...dest, price: `from ${formatINR(Math.round(minPrice))}` };
            }
          }
          return dest;
        } catch (e) {
          return dest;
        }
      }));

      setPopularDestinations(updated);
    };

    fetchCheapest();
  }, []);

  // Redirect Explore to Aviasales deep link with current date
  const handleExplore = (destination) => {
    // Origin fixed to BLR per requirement example
    const origin = 'BLR';

    // Use current local date
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    // Build path: ORIG dd mm DEST 1adult e.g., BLR0710PAR1
    const path = `${origin}${dd}${mm}${destination.iata}1`;

    // Build query params
    const qs = new URLSearchParams({
      currency: 'inr',
      depart_date: `${yyyy}-${mm}-${dd}`,
      destination_iata: destination.iata,
      language: 'en',
      locale: 'en-IN',
      marker: '654247._landings.Zz37462fb6687c47f49aae18e-654247',
      origin_iata: origin,
      return_date: ''
    });

    const url = `https://www.aviasales.com/search/${path}?${qs.toString()}`;
    window.location.href = url;
  };

  const featuredDeals = [
    {
      id: 1,
      type: 'Flight',
      typeColor: 'blue',
      discount: '-50%',
      title: 'Flash Sale: Europe Flights',
      description: 'Book round-trip flights to major European cities.',
      location: 'London, Paris, Rome',
      currentPrice: '$299',
      originalPrice: '$599',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      type: 'Hotel',
      typeColor: 'green',
      title: 'Luxury Hotels Sale',
      description: '5-star hotels with premium amenities.',
      location: 'Worldwide',
      currentPrice: '$150',
      originalPrice: '$250',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      type: 'Package',
      typeColor: 'gray',
      discount: '-31%',
      title: 'Tokyo Adventure Package',
      description: 'Flight + 4-night hotel + city tours included.',
      location: 'Tokyo, Japan',
      currentPrice: '$899',
      originalPrice: '$1299',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
    },

  ];

  // Handle click for deals
  const handleDealClick = (deal) => {
    if (!deal) return;
    // Hotel deal -> redirect to hotels comparer
    if (deal.type === 'Hotel' || deal.id === 2) {
      window.location.href = 'https://hotels-comparer.com/?marker=654247';
      return;
    }
    // Europe Flights (id 1) and Tokyo Adventure Package (id 3) -> show unavailable modal
    if (deal.id === 1 || deal.id === 3) {
      setDealModalMessage('This deal is not available at the moment. Please check back later.');
      setDealModalOpen(true);
      return;
    }
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <ResponsiveSearchForm onSearch={handleSearch} />
        </div>
      </div>

      {/* Popular Destinations Section */}
      <section className="popular-destinations">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Destinations</h2>
            <p className="section-subtitle">Discover amazing places around the world with our best deals and recommendations</p>
          </div>
          
          <div className="destinations-grid">
            {popularDestinations.map((destination) => (
              <div key={destination.id} className="destination-card">
                <div className="destination-image">
                  <img src={destination.image} alt={destination.name} />
                </div>
                <div className="destination-content">
                  <div className="destination-location">
                    <span className="location-icon">📍</span>
                    {destination.name}
                  </div>
                  <p className="destination-description">{destination.description}</p>
                  <div className="destination-price">{destination.price}</div>
                  <button className="explore-btn" onClick={() => handleExplore(destination)}>Explore</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="featured-deals">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="deal-icon">%</span>
              Featured Deals
            </h2>
            <p className="section-subtitle">Limited-time offers on flights, hotels, and vacation packages. Book now and save big!</p>
          </div>
          
          <div className="deals-grid">
            {featuredDeals.map((deal) => (
              <div key={deal.id} className="deal-card" onClick={() => handleDealClick(deal)}>
                <div className="deal-image">
                  <img src={deal.image} alt={deal.title} />
                  <div className={`deal-type ${deal.typeColor}`}>{deal.type}</div>
                  {deal.discount && <div className="deal-discount">{deal.discount}</div>}
                </div>
                <div className="deal-content">
                  <div className="deal-location">
                    <span className="location-icon">📍</span>
                    {deal.location}
                  </div>
                  <h3 className="deal-title">{deal.title}</h3>
                  <p className="deal-description">{deal.description}</p>
                  {deal.rating && <div className="deal-rating">{deal.rating}</div>}
                  <div className="deal-price">
                    <span className="current-price">{deal.currentPrice}</span>
                    <span className="original-price">{deal.originalPrice}</span>
                  </div>
                  <div className="deal-timer">
                    {(deal.type === 'Hotel' || deal.id === 2) ? 'Save up to 60%' : 'Deal ends in 0 days'}
                  </div>
                  <button
                    className="grab-deal-btn"
                    onClick={() => handleDealClick(deal)}
                  >
                    Grab This Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="view-all-deals">
            <button className="view-all-btn">View All Deals</button>
          </div>
        </div>
      </section>
      {/* Unavailable Deal Modal */}
      {dealModalOpen && (
        <div
          className="deal-modal-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={() => setDealModalOpen(false)}
        >
          <div
            className="deal-modal"
            style={{
              background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '420px', width: '90%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Deal unavailable</div>
            <div style={{ color: '#555', marginBottom: '16px' }}>{dealModalMessage}</div>
            <button
              className="close-deal-modal"
              style={{
                background: '#1f7a53', color: '#fff', border: 'none', padding: '10px 16px',
                borderRadius: '8px', cursor: 'pointer'
              }}
              onClick={() => setDealModalOpen(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;