const express = require('express');
const router = express.Router();
const axios = require('axios');
const Config = require('../utils/Config');
const Logger = require('../utils/Logger');

/**
 * Handler for newsletter/subscribe POST requests
 */
const handleSubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const subscribeUrl = Config.get('hashtagcms.subscribe_api');
        
        if (!subscribeUrl) {
            Logger.error('Subscribe API URL not configured');
            return res.status(500).json({
                success: false,
                message: 'Newsletter service is not configured'
            });
        }

        const response = await axios.post(subscribeUrl, {
            email,
            site: Config.get('hashtagcms.context')
        }, {
            headers: {
                'x-api-secret': Config.get(`hashtagcms.api_secrets.${Config.get('hashtagcms.context')}`) || '',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        Logger.info('Newsletter subscription successful', { email });
        
        return res.json({
            success: true,
            message: response.data?.message || 'Successfully subscribed to newsletter!'
        });

    } catch (error) {
        Logger.error('Newsletter subscription failed', { 
            error: error.message,
            response: error.response?.data 
        });

        const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
        
        return res.status(error.response?.status || 500).json({
            success: false,
            message: errorMessage
        });
    }
};

// POST /common/subscribe and /common/newsletter - both use the same handler
router.post('/subscribe', handleSubscribe);
router.post('/newsletter', handleSubscribe);

/**
 * POST /common/contact
 * Handle contact form submission
 */
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, comment } = req.body;

        // Basic validation
        const errors = {};
        if (!name || name.trim().length === 0) {
            errors.name = 'Name is required';
        }
        if (!email || email.trim().length === 0) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!comment || comment.trim().length === 0) {
            errors.comment = 'Comment is required';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: errors
            });
        }

        const contactUrl = Config.get('hashtagcms.contact_api');
        
        if (!contactUrl) {
            Logger.error('Contact API URL not configured');
            return res.status(500).json({
                success: false,
                message: 'Contact service is not configured'
            });
        }

        const response = await axios.post(contactUrl, {
            name,
            email,
            phone: phone || '',
            comment,
            site: Config.get('hashtagcms.context')
        }, {
            headers: {
                'x-api-secret': Config.get(`hashtagcms.api_secrets.${Config.get('hashtagcms.context')}`) || '',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        Logger.info('Contact form submitted successfully', { email, name });
        
        return res.json({
            success: true,
            message: response.data?.message || 'Your message has been sent successfully!'
        });

    } catch (error) {
        Logger.error('Contact form submission failed', { 
            error: error.message,
            response: error.response?.data 
        });

        const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
        
        return res.status(error.response?.status || 500).json({
            success: false,
            message: errorMessage
        });
    }
});

/**
 * POST /common/publish
 * Proxy analytics data to HashtagCMS server
 */
router.post('/publish', async (req, res) => {
    const publishUrl = Config.get('hashtagcms.publish_api');
    
    Logger.debug('Analytics Proxy: Request received', { 
        url: publishUrl,
        body: req.body 
    });

    try {
        if (!publishUrl) {
            return res.status(500).json({ success: false, message: 'Publish API not configured' });
        }

        const payload = {
            ...req.body,
            site: req.body.site || Config.get('hashtagcms.context')
        };

        const response = await axios.post(publishUrl, payload, {
            headers: {
                'x-api-secret': Config.get(`hashtagcms.api_secrets.${Config.get('hashtagcms.context')}`) || '',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        Logger.info('Analytics Proxy: Published successfully', { categoryId: payload.categoryId });

        return res.json(response.data);

    } catch (error) {
        Logger.error('Analytics Proxy: Publish failed', { 
            url: publishUrl,
            error: error.message,
            response: error.response?.data 
        });

        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to publish analytics'
        });
    }
});

module.exports = router;
