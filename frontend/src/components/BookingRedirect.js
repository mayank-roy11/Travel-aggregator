import React, { useEffect, useRef } from 'react';
import './BookingRedirect.css';

const BookingRedirect = ({ bookingData, onClose }) => {
  const formRef = useRef(null);
  const pixelRef = useRef(null);

  useEffect(() => {
    if (!bookingData) return;

    const redirect = (timeout) => {
      setTimeout(() => {
        if (bookingData.method === 'GET') {
          // Direct redirect for GET method
          window.location.href = bookingData.url;
        } else if (bookingData.method === 'POST') {
          // Submit form for POST method
          if (formRef.current) {
            formRef.current.submit();
          }
        }
      }, timeout);
    };

    // Wait for pixel to load before redirecting
    const pixel = pixelRef.current;
    if (pixel) {
      pixel.addEventListener('load', () => {
        redirect(3000); // 3 second delay
      }, false);
    }
  }, [bookingData]);

  if (!bookingData) {
    return null;
  }

  return (
    <div className="booking-redirect-overlay">
      <div className="booking-redirect-container">
        <div className="booking-redirect-content">
          <h2>Redirecting to Booking Site</h2>
          <p>You are being redirected to the booking agency's website...</p>
          
          {/* Tracking pixel */}
          <img 
            ref={pixelRef}
            width="0" 
            height="0" 
            id="pixel" 
            src={`//yasen.aviasales.com/adaptors/pixel_click.png?click_id=${bookingData.click_id}&gate_id=${bookingData.gate_id}`}
            alt=""
          />

          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <p className="redirect-message">
            Please wait while we redirect you to{' '}
            <a href={bookingData.url} className="partner-link" target="_blank" rel="noopener noreferrer">
              {bookingData.url}
            </a>
          </p>

          {/* Form for POST method */}
          {bookingData.method === 'POST' && bookingData.params && (
            <form ref={formRef} method="POST" action={bookingData.url} style={{ display: 'none' }}>
              {Object.entries(bookingData.params).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
            </form>
          )}

          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingRedirect; 