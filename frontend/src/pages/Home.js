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

  const popularDestinations = [
    {
      id: 1,
      name: 'Paris, France',
      description: 'City of lights and romance',
      price: 'from $299',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Tokyo, Japan',
      description: 'Modern culture meets tradition',
      price: 'from $599',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'New York, USA',
      description: 'The city that never sleeps',
      price: 'from $199',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'London, UK',
      description: 'Rich history and modern charm',
      price: 'from $249',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop'
    }
  ];

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
      discount: '-40%',
      title: 'Luxury Hotels 40% Off',
      description: '5-star hotels with premium amenities.',
      location: 'Worldwide',
      currentPrice: '$150',
      originalPrice: '$250',
      rating: '★ 4.8 rating',
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

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <SearchForm onSearch={handleSearch} />
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
                  <button className="explore-btn">Explore</button>
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
              <div key={deal.id} className="deal-card">
                <div className="deal-image">
                  <img src={deal.image} alt={deal.title} />
                  <div className={`deal-type ${deal.typeColor}`}>{deal.type}</div>
                  <div className="deal-discount">{deal.discount}</div>
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
                  <div className="deal-timer">Deal ends in 0 days</div>
                  <button className="grab-deal-btn">Grab This Deal</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="view-all-deals">
            <button className="view-all-btn">View All Deals</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 