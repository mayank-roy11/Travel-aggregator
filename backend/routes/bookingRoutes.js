const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingService');

/**
 * Generate booking URL for a specific flight and pricing option
 * POST /api/booking/generate-url
 */
router.post('/generate-url', async (req, res) => {
    try {
        const { searchId, termUrl } = req.body;
        
        // Validate request
        const validation = bookingService.validateBookingRequest({ searchId, termUrl });
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        // Generate booking URL
        const result = await bookingService.generateBookingUrl(searchId, termUrl);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                details: result.details
            });
        }

        const { data } = result;
        
        // Return booking data for frontend to handle
        res.json({
            success: true,
            data: {
                method: data.method,
                url: data.url,
                params: data.params,
                click_id: data.click_id,
                gate_id: data.gate_id,
                redirectUrl: `/api/booking/redirect?searchId=${searchId}&termUrl=${termUrl}`
            }
        });

    } catch (error) {
        console.error('❌ Booking route error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate booking URL'
        });
    }
    
    // Move route logs to the end
    console.log('\n' + '='.repeat(80));
    console.log('🔔 BOOKING ROUTE DEBUG INFO');
    console.log('='.repeat(80));
    console.log('🔔 Booking route hit - /api/booking/generate-url');
    console.log('📋 Request body:', req.body);
    console.log('📋 Booking request validated:', { searchId: req.body.searchId, termUrl: req.body.termUrl });
    console.log('='.repeat(80) + '\n');
});

/**
 * Redirect page for agency booking
 * GET /api/booking/redirect
 */
router.get('/redirect', async (req, res) => {
    try {
        const { searchId, termUrl } = req.query;
        
        // Validate request
        const validation = bookingService.validateBookingRequest({ searchId, termUrl });
        if (!validation.valid) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2>Invalid Booking Request</h2>
                        <p>${validation.error}</p>
                        <a href="/">Return to MyTrippers</a>
                    </body>
                </html>
            `);
        }

        console.log('🔄 Redirect request received:', { searchId, termUrl });

        // Generate booking URL
        const result = await bookingService.generateBookingUrl(searchId, termUrl);
        
        if (!result.success) {
            return res.status(500).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2>Booking Error</h2>
                        <p>Failed to generate booking URL: ${result.error}</p>
                        <a href="/">Return to MyTrippers</a>
                    </body>
                </html>
            `);
        }

        // Create redirect page
        const redirectHtml = bookingService.createRedirectPage(result.data);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(redirectHtml);

    } catch (error) {
        console.error('❌ Redirect route error:', error);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2>System Error</h2>
                    <p>An unexpected error occurred. Please try again.</p>
                    <a href="/">Return to MyTrippers</a>
                </body>
            </html>
        `);
    }
});

/**
 * Health check for booking service
 * GET /api/booking/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Booking service is running',
    timestamp: new Date().toISOString(),
    env: {
      hasToken: !!process.env.TRAVELPAYOUTS_TOKEN,
      hasMarker: !!process.env.TRAVELPAYOUTS_MARKER,
      marker: process.env.TRAVELPAYOUTS_MARKER
    }
  });
  
  // Move health check logs to the end
  console.log('\n' + '='.repeat(80));
  console.log('🏥 HEALTH CHECK DEBUG INFO');
  console.log('='.repeat(80));
  console.log('🔔 Health check endpoint hit');
  console.log('='.repeat(80) + '\n');
});

module.exports = router; 