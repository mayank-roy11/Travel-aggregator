/**
 * Booking Service for Travelpayouts Agency Links
 * Handles generation of booking URLs and agency redirects
 */

const axios = require('axios');

class BookingService {
    constructor() {
        this.baseUrl = 'https://api.travelpayouts.com/v1';
        this.token = process.env.TRAVELPAYOUTS_TOKEN;
        this.marker = process.env.TRAVELPAYOUTS_MARKER;
        
        console.log('🔧 BookingService initialized with:', {
            baseUrl: this.baseUrl,
            hasToken: !!this.token,
            hasMarker: !!this.marker,
            marker: this.marker,
            tokenLength: this.token ? this.token.length : 0,
            markerLength: this.marker ? this.marker.length : 0,
            tokenPrefix: this.token ? this.token.substring(0, 8) : 'undefined'
        });
    }

    /**
     * Generate booking URL for a specific flight and pricing option
     * @param {string} searchId - Search ID from flight search response
     * @param {string} termUrl - URL parameter from terms object
     * @returns {Object} Booking response with URL and method
     */
    async generateBookingUrl(searchId, termUrl) {
        try {
            // URL encode the termUrl to handle special characters
            const encodedTermUrl = encodeURIComponent(termUrl);
            const url = `${this.baseUrl}/flight_searches/${searchId}/clicks/${encodedTermUrl}.json?marker=${this.marker}`;
            
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            // Move all debugging logs to the end
            console.log('\n' + '='.repeat(80));
            console.log('🔗 BOOKING URL GENERATION DEBUG INFO');
            console.log('='.repeat(80));
            console.log(`🔗 Generating booking URL for search: ${searchId}, term: ${termUrl}`);
            console.log(`🔍 Debug - searchId type: ${typeof searchId}, termUrl type: ${typeof termUrl}`);
            console.log(`🔍 Debug - searchId valid: ${!!searchId}, termUrl valid: ${!!termUrl}`);
            console.log(`🔗 Full booking URL: ${url}`);
            console.log(`🔍 Request headers:`, {
                'Content-Type': 'application/json'
            });
            console.log(`🔍 Note: No Authorization header - using marker-based auth`);
            console.log('✅ Booking URL generated successfully:', {
                gateId: response.data.gate_id,
                clickId: response.data.click_id,
                method: response.data.method,
                hasUrl: !!response.data.url,
                url: response.data.url,
                hasParams: !!response.data.params,
                params: response.data.params
            });
            console.log('='.repeat(80) + '\n');

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            // Move error logs to the end too
            console.log('\n' + '='.repeat(80));
            console.log('❌ BOOKING URL GENERATION ERROR');
            console.log('='.repeat(80));
            console.error('❌ Error generating booking URL:', error.message);
            
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            console.log('='.repeat(80) + '\n');

            return {
                success: false,
                error: error.message,
                details: error.response?.data || null
            };
        }
    }

    /**
     * Create redirect page HTML for POST method agencies
     * @param {Object} bookingData - Booking response data
     * @returns {string} HTML page for redirect
     */
    createRedirectPage(bookingData) {
        const { url, method, params, click_id, gate_id } = bookingData;
        
        let formFields = '';
        if (method === 'POST' && params) {
            formFields = Object.entries(params)
                .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
                .join('\n');
        }

            const trackingPixel = `<img width="0" height="0" id="pixel" src="//yasen.aviasales.com/adaptors/pixel_click.png?click_id=${click_id}&gate_id=${gate_id}">`;

    let redirectScript = '';
    if (method === 'GET') {
        redirectScript = `
        <script>
            var redirect = function(timeout){
                setTimeout(function(){
                    window.location.href = '${url}';
                }, timeout);
            }
        </script>`;
    } else {
        redirectScript = `
        <form id="redirect_params_form" method="POST" action='${url}'>
            ${formFields}
        </form>
        <script>
            var redirect = function(timeout){
                setTimeout(function(){
                    document.getElementById('redirect_params_form').submit();
                }, timeout);
            }
        </script>`;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting to Booking Agency - MyTrippers</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .redirect-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 90%;
        }
        .logo {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }
        .agency-info {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 1rem;
        }
        .progressbar {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-top: 1rem;
        }
        #redirect_params_form {
            display: none;
        }
    </style>
</head>
<body>
    <div class="redirect-container">
        <div class="logo">✈️ MyTrippers</div>
        <div class="spinner"></div>
        <div class="message">Redirecting you to the booking agency...</div>
        <div class="agency-info">Please wait while we prepare your booking</div>
        <div class="progressbar">Please wait...</div>
        
        ${trackingPixel}
        ${redirectScript}
    </div>

    <script>
        var timeout = 3000;
        pixel_booking_img = document.getElementById('pixel');
        pixel_booking_img.addEventListener('load', function() {
            redirect(timeout);
        }, false);
    </script>
</body>
</html>`;
    }

    /**
     * Validate booking request parameters
     * @param {Object} params - Request parameters
     * @returns {Object} Validation result
     */
    validateBookingRequest(params) {
        const { searchId, termUrl } = params;
        
        if (!searchId) {
            return { valid: false, error: 'Search ID is required' };
        }
        
        if (!termUrl) {
            return { valid: false, error: 'Term URL is required' };
        }
        
        if (!this.token || !this.marker) {
            return { valid: false, error: 'API credentials not configured' };
        }
        
        return { valid: true };
    }
}

module.exports = new BookingService(); 